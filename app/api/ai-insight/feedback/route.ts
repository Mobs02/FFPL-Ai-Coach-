import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const sessionClient = await getSupabaseServerClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { recommendationId, feedback } = await request.json();
  if (feedback !== "up" && feedback !== "down") {
    return NextResponse.json({ error: "Invalid feedback value" }, { status: 400 });
  }

  // manager_id filter is load-bearing, not decorative — without it any
  // signed-in user could vote on another manager's recommendation by id.
  const { error, data } = await supabase
    .from("ai_recommendations")
    .update({ feedback })
    .eq("id", recommendationId)
    .eq("manager_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
