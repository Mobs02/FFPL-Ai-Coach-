import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const [snapshots, insights] = await Promise.all([
    supabase.from("gameweek_snapshots").select("*").eq("manager_id", user.id),
    supabase.from("ai_recommendations").select("*").eq("manager_id", user.id),
  ]);

  return NextResponse.json({ snapshots: snapshots.data, insights: insights.data });
}
