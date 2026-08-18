import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { generateAiInsight } from "@/lib/ai-insight";
import { getBootstrap } from "@/lib/fpl";

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: manager } = await supabase.from("managers").select("fpl_manager_id").eq("id", user.id).maybeSingle();
  if (!manager) return NextResponse.json({ error: "Link your FPL team first" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  let gameweek = body.gameweek;
  if (!gameweek) {
    const bootstrap = await getBootstrap();
    gameweek =
      bootstrap.events.find((e: any) => e.is_current)?.id ??
      bootstrap.events.filter((e: any) => e.finished).slice(-1)[0]?.id;
  }
  if (!gameweek) {
    return NextResponse.json({ error: "No gameweek to generate a recommendation for yet." }, { status: 400 });
  }

  try {
    const result = await generateAiInsight({ managerId: user.id, fplManagerId: manager.fpl_manager_id, gameweek });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
