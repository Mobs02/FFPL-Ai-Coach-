import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

// Tier 2 (proper per-account Phase 4): same principle as /api/team — this
// never calls FPL, it reads whatever the cron job (Phase 5) already stored
// for the signed-in user, across all of their leagues.
export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: leagueSnapshots } = await supabase
    .from("league_snapshots")
    .select("league_id, league_name, your_rank, standings_json, gameweek")
    .eq("manager_id", user.id)
    .order("gameweek", { ascending: false });

  // one row per league per gameweek — keep only the latest row per league
  const latestPerLeague = new Map<number, any>();
  for (const row of leagueSnapshots ?? []) {
    if (!latestPerLeague.has(row.league_id)) latestPerLeague.set(row.league_id, row);
  }

  const leagues = [...latestPerLeague.values()].map((row) => ({
    leagueId: row.league_id,
    leagueName: row.league_name,
    yourRank: row.your_rank,
    top: row.standings_json?.top ?? [],
    aheadOfYou: row.standings_json?.aheadOfYou ?? null,
  }));

  return NextResponse.json({ leagues });
}
