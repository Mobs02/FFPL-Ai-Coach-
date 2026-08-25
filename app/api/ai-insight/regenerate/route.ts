import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { generateAiInsight } from "@/lib/ai-insight";
import { getBootstrap } from "@/lib/fpl";
import { serverErrorResponse } from "@/lib/api-error";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST() {
  const sessionClient = await getSupabaseServerClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  // Defense-in-depth alongside the DB-backed cooldown below: the cooldown
  // read-then-write below has a race window (two rapid requests can both
  // read "not on cooldown" before either write lands), so a request-level
  // limiter closes that gap too.
  if (!checkRateLimit(`regenerate:${user.id}`, { max: 2, windowMs: 10_000 })) {
    return NextResponse.json({ error: "You can regenerate once per hour." }, { status: 429 });
  }

  const { data: manager } = await supabase
    .from("managers")
    .select("fpl_manager_id, last_manual_regenerate_at")
    .eq("id", user.id)
    .maybeSingle();
  if (!manager) return NextResponse.json({ error: "Link your FPL team first" }, { status: 404 });

  if (manager.last_manual_regenerate_at && Date.now() - new Date(manager.last_manual_regenerate_at).getTime() < 60 * 60 * 1000) {
    return NextResponse.json({ error: "You can regenerate once per hour." }, { status: 429 });
  }

  // Record the attempt before doing the actual work — if the AI call below
  // fails partway through, the cooldown still applies rather than letting a
  // failed attempt be retried instantly in a loop.
  await supabase.from("managers").update({ last_manual_regenerate_at: new Date().toISOString() }).eq("id", user.id);

  const bootstrap = await getBootstrap();
  const gameweek =
    bootstrap.events.find((e: any) => e.is_current)?.id ??
    bootstrap.events.filter((e: any) => e.finished).slice(-1)[0]?.id;
  if (!gameweek) {
    return NextResponse.json({ error: "No gameweek to generate a recommendation for yet." }, { status: 400 });
  }

  try {
    const result = await generateAiInsight({ managerId: user.id, fplManagerId: manager.fpl_manager_id, gameweek });
    return NextResponse.json(result);
  } catch (err) {
    return serverErrorResponse("ai-insight/regenerate", err as Error);
  }
}
