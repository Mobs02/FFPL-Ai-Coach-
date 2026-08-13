import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

// Tier 2 (proper per-account Phase 4): this route never calls FPL. It reads
// the latest snapshot the cron job (Phase 5) already stored — that's what
// makes the "one requester" architecture actually true. Every dashboard view
// is a cheap database read, regardless of how many people open it at once.
export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: manager } = await supabase.from("managers").select("id").eq("id", user.id).maybeSingle();
  if (!manager) return NextResponse.json({ needsOnboarding: true }, { status: 404 });

  const { data: snapshot } = await supabase
    .from("gameweek_snapshots")
    .select("gameweek, total_points, overall_rank, gameweek_points, free_transfers, squad_json, captured_at")
    .eq("manager_id", user.id)
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!snapshot) {
    return NextResponse.json({ error: "No data yet — the next scheduled poll will populate this." }, { status: 404 });
  }

  return NextResponse.json({
    gameweek: snapshot.gameweek,
    totalPoints: snapshot.total_points,
    overallRank: snapshot.overall_rank,
    gameweekPoints: snapshot.gameweek_points,
    freeTransfers: snapshot.free_transfers,
    squad: snapshot.squad_json,
    capturedAt: snapshot.captured_at,
  });
}
