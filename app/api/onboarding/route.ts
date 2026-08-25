import { NextResponse } from "next/server";
import { z } from "zod";
import { getEntry, getEntryHistory, getEntryPicks, getBootstrap, buildSquad, CURRENT_SEASON } from "@/lib/fpl";
import { supabase } from "@/lib/supabase"; // service-role — no INSERT policy exists on `managers`, so this needs to bypass RLS
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { serverErrorResponse } from "@/lib/api-error";
import { checkRateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({ fplManagerId: z.coerce.number().int().positive() });

export async function POST(request: Request) {
  const sessionClient = await getSupabaseServerClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  if (!checkRateLimit(`onboarding:${user.id}`, { max: 5, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many attempts. Wait a moment and try again." }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid FPL manager ID (numbers only)." }, { status: 400 });
  }
  const { fplManagerId } = parsed.data;

  try {
    await getEntry(fplManagerId); // throws if the ID doesn't exist
  } catch {
    return NextResponse.json({ error: "We couldn't find that FPL manager ID — double check the number from your FPL URL." }, { status: 400 });
  }
  // Fetched up front (not just for a brand-new snapshot) — someone signing up
  // mid-season may have already played chips before ever using SquadScout AI,
  // so this needs real history, not an empty default until the next cron run.
  const entryHistory = await getEntryHistory(fplManagerId);
  const chipsUsed = (entryHistory.chips ?? []).map((c: any) => ({ name: c.name, event: c.event }));

  const { error } = await supabase.from("managers").insert({ id: user.id, fpl_manager_id: fplManagerId, chips_used: chipsUsed });
  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "That FPL manager ID is already linked to another account." }, { status: 409 });
    }
    return serverErrorResponse("onboarding", error);
  }

  // The one deliberate exception to "the dashboard never live-fetches": a
  // brand-new account has no cron-populated snapshot yet, and would otherwise
  // hit the 404 in /api/team until the next scheduled poll.
  const bootstrap = await getBootstrap();
  const currentEvent = bootstrap.events.find((e: any) => e.is_current)?.id
    ?? bootstrap.events.filter((e: any) => e.finished).slice(-1)[0]?.id;

  if (currentEvent) {
    const picks = await getEntryPicks(fplManagerId, currentEvent);
    const entry = await getEntry(fplManagerId);

    await supabase.from("gameweek_snapshots").upsert({
      manager_id: user.id,
      season: CURRENT_SEASON,
      gameweek: currentEvent,
      total_points: entry.summary_overall_points,
      gameweek_points: picks.entry_history.points,
      overall_rank: entry.summary_overall_rank,
      squad_json: buildSquad(bootstrap, picks),
    }, { onConflict: "manager_id,gameweek,season" });
  }
  // If no gameweek has started yet (preseason), there's nothing to snapshot —
  // the first cron run once GW1 begins will populate it.

  return NextResponse.json({ ok: true });
}
