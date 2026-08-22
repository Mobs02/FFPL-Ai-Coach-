import { NextResponse } from "next/server";
import { getEntry, getEntryHistory, getEntryPicks, findManagerInLeague, getBootstrap, buildSquad, CURRENT_SEASON } from "@/lib/fpl";
import { supabase } from "@/lib/supabase";
import { sendDeadlineReminder } from "@/lib/resend";
import { generateAiInsight } from "@/lib/ai-insight";

type Manager = { id: string; fpl_manager_id: number; league_ids: number[] };

async function pollAndSnapshot(manager: Manager, bootstrap: any, currentEvent: number) {
  const [entry, picks, entryHistory] = await Promise.all([
    getEntry(manager.fpl_manager_id),
    getEntryPicks(manager.fpl_manager_id, currentEvent),
    getEntryHistory(manager.fpl_manager_id),
  ]);

  // Chip usage lives on the manager record (season-cumulative), not the
  // per-gameweek snapshot — each entry carries the chip name and which
  // gameweek it was played, e.g. {"name": "wildcard", "event": 5}.
  await supabase
    .from("managers")
    .update({ chips_used: (entryHistory.chips ?? []).map((c: any) => ({ name: c.name, event: c.event })) })
    .eq("id", manager.id);

  // Free transfers: FPL doesn't expose this directly, so it's tracked from
  // the previous stored value — read it before the upsert below overwrites it.
  const { data: previous } = await supabase
    .from("gameweek_snapshots")
    .select("free_transfers")
    .eq("manager_id", manager.id)
    .eq("season", CURRENT_SEASON)
    .order("gameweek", { ascending: false })
    .limit(1)
    .maybeSingle();
  const transfersMadeThisWeek = picks.entry_history.event_transfers ?? 0;
  const freeTransfers = Math.min(5, Math.max(0, (previous?.free_transfers ?? 1) - transfersMadeThisWeek + 1));

  // upsert, not insert — every poll for the same manager+gameweek updates one
  // row in place rather than adding a new row every 15 minutes.
  await supabase.from("gameweek_snapshots").upsert({
    manager_id: manager.id,
    season: CURRENT_SEASON,
    gameweek: currentEvent,
    total_points: entry.summary_overall_points,
    gameweek_points: picks.entry_history.points,
    overall_rank: entry.summary_overall_rank,
    free_transfers: freeTransfers,
    squad_json: buildSquad(bootstrap, picks),
  }, { onConflict: "manager_id,gameweek,season" });

  // One row per league this manager is in.
  for (const leagueId of manager.league_ids ?? []) {
    const { leagueName, rank, top, aheadOfYou } = await findManagerInLeague(leagueId, manager.fpl_manager_id);

    await supabase.from("league_snapshots").upsert({
      manager_id: manager.id,
      season: CURRENT_SEASON,
      league_id: leagueId,
      league_name: leagueName,
      gameweek: currentEvent,
      your_rank: rank,
      standings_json: { top, aheadOfYou },
    }, { onConflict: "manager_id,league_id,gameweek,season" });
  }
}

// Reminder emails all share one deadline, so without spreading them out
// every manager's email would fire in the same ~1h window — fine at a
// handful of users, but Resend's free tier caps at 100 emails/day. Each
// manager gets a deterministic personal threshold somewhere between 12h and
// 36h before the deadline (stable across runs, since it's derived from their
// own id), so sends spread across cron runs — and often across two calendar
// days — instead of clustering into one send-everything window.
const REMINDER_WINDOW_MIN_HOURS = 12;
const REMINDER_WINDOW_MAX_HOURS = 36;

function reminderThresholdHours(managerId: string): number {
  let hash = 0;
  for (let i = 0; i < managerId.length; i++) {
    hash = (hash * 31 + managerId.charCodeAt(i)) | 0;
  }
  const span = REMINDER_WINDOW_MAX_HOURS - REMINDER_WINDOW_MIN_HOURS;
  return REMINDER_WINDOW_MIN_HOURS + (Math.abs(hash) % (span + 1));
}

// Runs independently of whether a gameweek is currently live, since the very
// first reminder (for GW1) needs to fire during preseason.
async function sendDeadlineReminders(bootstrap: any, currentEvent: number | undefined) {
  const nextEvent = bootstrap.events.find((e: any) => e.is_next);
  if (!nextEvent) return { sent: 0 };

  const hoursRemaining = (new Date(nextEvent.deadline_time).getTime() - Date.now()) / 1000 / 60 / 60;
  if (hoursRemaining > REMINDER_WINDOW_MAX_HOURS || hoursRemaining <= 0) return { sent: 0 };

  const { data: managers } = await supabase
    .from("managers")
    .select("id")
    .eq("email_reminders_enabled", true);

  let sent = 0;
  for (const manager of managers ?? []) {
    // Not this manager's turn yet — their personal window hasn't opened.
    if (hoursRemaining > reminderThresholdHours(manager.id)) continue;

    const { data: alreadySent } = await supabase
      .from("deadline_reminders_sent")
      .select("manager_id")
      .eq("manager_id", manager.id)
      .eq("gameweek", nextEvent.id)
      .eq("season", CURRENT_SEASON)
      .maybeSingle();
    if (alreadySent) continue;

    const { data: authUser } = await supabase.auth.admin.getUserById(manager.id);
    const { data: latestSnapshot } = await supabase
      .from("gameweek_snapshots")
      .select("gameweek_points, free_transfers")
      .eq("manager_id", manager.id)
      .order("captured_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    // Recommendations are generated for currentEvent (the already-locked
    // gameweek whose squad picks are visible) — not nextEvent, whose deadline
    // hasn't passed yet. Look them up by the key they're actually stored
    // under, or this always misses.
    const { data: recommendation } = currentEvent
      ? await supabase
          .from("ai_recommendations")
          .select("headline")
          .eq("manager_id", manager.id)
          .eq("gameweek", currentEvent)
          .eq("season", CURRENT_SEASON)
          .maybeSingle()
      : { data: null };

    if (authUser?.user?.email) {
      await sendDeadlineReminder(
        authUser.user.email,
        hoursRemaining,
        nextEvent.id,
        latestSnapshot?.gameweek_points ?? 0,
        latestSnapshot?.free_transfers ?? 1,
        recommendation?.headline ?? null,
      );
      await supabase.from("deadline_reminders_sent").insert({ manager_id: manager.id, season: CURRENT_SEASON, gameweek: nextEvent.id });
      sent++;
    }
  }
  return { sent };
}

// Generates one AI recommendation per manager per gameweek — the unique
// constraint on ai_recommendations plus this existence check makes it a
// self-contained idempotent step: safe to run on every poll, since it skips
// everyone who already has one. One bad/rate-limited call is caught so it
// doesn't take down the rest of the batch.
async function generateMissingAiInsights(managers: Manager[], currentEvent: number) {
  let generated = 0;
  const BATCH_SIZE = 3; // AI calls are heavier than a snapshot poll — smaller batches
  for (let i = 0; i < managers.length; i += BATCH_SIZE) {
    const batch = managers.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (manager) => {
        const { data: existing } = await supabase
          .from("ai_recommendations")
          .select("id")
          .eq("manager_id", manager.id)
          .eq("gameweek", currentEvent)
          .eq("season", CURRENT_SEASON)
          .maybeSingle();
        if (existing) return;

        try {
          await generateAiInsight({ managerId: manager.id, fplManagerId: manager.fpl_manager_id, gameweek: currentEvent });
          generated++;
        } catch (err) {
          console.error(`AI insight failed for manager ${manager.id}:`, (err as Error).message);
        }
      }),
    );
  }
  return generated;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const bootstrap = await getBootstrap();
  const currentEvent =
    bootstrap.events.find((e: any) => e.is_current)?.id ??
    bootstrap.events.filter((e: any) => e.finished).slice(-1)[0]?.id;

  const { sent: remindersSent } = await sendDeadlineReminders(bootstrap, currentEvent);

  if (!currentEvent) {
    return NextResponse.json({
      ok: true,
      message: "Season hasn't started yet — nothing to snapshot.",
      managersPolled: 0,
      remindersSent,
    });
  }

  const { data: managers } = await supabase.from("managers").select("id, fpl_manager_id, league_ids");

  const BATCH_SIZE = 10; // keeps this under Vercel's function time limit as accounts grow
  for (let i = 0; i < (managers?.length ?? 0); i += BATCH_SIZE) {
    const batch = managers!.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map((m) => pollAndSnapshot(m, bootstrap, currentEvent)));
  }

  const aiInsightsGenerated = await generateMissingAiInsights(managers ?? [], currentEvent);

  return NextResponse.json({
    ok: true,
    gameweek: currentEvent,
    managersPolled: managers?.length ?? 0,
    remindersSent,
    aiInsightsGenerated,
  });
}
