import { NextResponse } from "next/server";
import { getEntry, getEntryPicks, findManagerInLeague, getBootstrap, buildSquad, CURRENT_SEASON } from "@/lib/fpl";
import { supabase } from "@/lib/supabase";

type Manager = { id: string; fpl_manager_id: number; league_ids: number[] };

async function pollAndSnapshot(manager: Manager, bootstrap: any, currentEvent: number) {
  const [entry, picks] = await Promise.all([
    getEntry(manager.fpl_manager_id),
    getEntryPicks(manager.fpl_manager_id, currentEvent),
  ]);

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

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const bootstrap = await getBootstrap();
  const currentEvent =
    bootstrap.events.find((e: any) => e.is_current)?.id ??
    bootstrap.events.filter((e: any) => e.finished).slice(-1)[0]?.id;

  if (!currentEvent) {
    return NextResponse.json({ ok: true, message: "Season hasn't started yet — nothing to snapshot.", managersPolled: 0 });
  }

  const { data: managers } = await supabase.from("managers").select("id, fpl_manager_id, league_ids");

  const BATCH_SIZE = 10; // keeps this under Vercel's function time limit as accounts grow
  for (let i = 0; i < (managers?.length ?? 0); i += BATCH_SIZE) {
    const batch = managers!.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map((m) => pollAndSnapshot(m, bootstrap, currentEvent)));
  }

  return NextResponse.json({ ok: true, gameweek: currentEvent, managersPolled: managers?.length ?? 0 });
}
