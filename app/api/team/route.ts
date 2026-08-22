import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getEntry, getBootstrap } from "@/lib/fpl";

// Tier 2 (proper per-account Phase 4): this route never calls FPL for the
// normal case — it reads the latest snapshot the cron job (Phase 5) already
// stored, which is what makes the "one requester" architecture actually
// true. The one deliberate exception is the pre-season/no-snapshot-yet
// fallback below: FPL's picks endpoint 404s until a gameweek's deadline
// passes, so there's nothing for the cron to have stored, but the entry
// endpoint (team name, manager name) is public year-round — a single cheap
// live call here beats showing a bare error to a brand-new or pre-season user.
export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: manager } = await supabase.from("managers").select("id, fpl_manager_id, chips_used").eq("id", user.id).maybeSingle();
  if (!manager) return NextResponse.json({ needsOnboarding: true }, { status: 404 });

  const { data: snapshot } = await supabase
    .from("gameweek_snapshots")
    .select("gameweek, total_points, overall_rank, gameweek_points, free_transfers, squad_json, captured_at")
    .eq("manager_id", user.id)
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!snapshot) {
    const [entry, bootstrap] = await Promise.all([getEntry(manager.fpl_manager_id), getBootstrap()]);
    const nextEvent = bootstrap.events.find((e: any) => e.is_next);
    return NextResponse.json({
      noSnapshotYet: true,
      teamName: entry.name,
      managerName: `${entry.player_first_name} ${entry.player_last_name}`,
      nextDeadline: nextEvent?.deadline_time ?? null,
      error: "Squad and points aren't available yet — FPL only reveals this once a gameweek's deadline passes.",
    }, { status: 404 });
  }

  return NextResponse.json({
    gameweek: snapshot.gameweek,
    totalPoints: snapshot.total_points,
    overallRank: snapshot.overall_rank,
    gameweekPoints: snapshot.gameweek_points,
    freeTransfers: snapshot.free_transfers,
    squad: snapshot.squad_json,
    capturedAt: snapshot.captured_at,
    chipsUsed: manager.chips_used ?? [],
  });
}
