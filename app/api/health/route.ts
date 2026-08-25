import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { anthropic } from "@/lib/anthropic";
import { isValidCronSecret } from "@/lib/cron-auth";

// Gated behind CRON_SECRET: this used to be publicly reachable and made a
// real, billed Anthropic call on every hit with no rate limit — an
// unauthenticated cost-abuse vector. It also returned raw error.message from
// both services, which is an internals leak for an endpoint anyone could hit.
export async function GET(request: Request) {
  if (!isValidCronSecret(request.headers.get("authorization"))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const results: Record<string, string> = {};

  try {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.getSession();
    if (error) console.error("[health] supabase check failed:", error.message);
    results.supabase = error ? "error" : "ok";
  } catch (err) {
    console.error("[health] supabase check threw:", (err as Error).message);
    results.supabase = "error";
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 10,
      messages: [{ role: "user", content: "Say 'ok'." }],
    });
    results.anthropic = message.content[0].type === "text" ? "ok" : "unexpected response";
  } catch (err) {
    console.error("[health] anthropic check threw:", (err as Error).message);
    results.anthropic = "error";
  }

  return NextResponse.json(results);
}
