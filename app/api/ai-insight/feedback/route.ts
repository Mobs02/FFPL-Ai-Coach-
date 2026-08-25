import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { serverErrorResponse } from "@/lib/api-error";

const bodySchema = z.object({
  recommendationId: z.coerce.number().int().positive(),
  feedback: z.enum(["up", "down"]),
});

export async function POST(request: Request) {
  const sessionClient = await getSupabaseServerClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid feedback value" }, { status: 400 });
  }
  const { recommendationId, feedback } = parsed.data;

  // manager_id filter is load-bearing, not decorative — without it any
  // signed-in user could vote on another manager's recommendation by id.
  const { error, data } = await supabase
    .from("ai_recommendations")
    .update({ feedback })
    .eq("id", recommendationId)
    .eq("manager_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return serverErrorResponse("ai-insight/feedback", error);
  if (!data) return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
