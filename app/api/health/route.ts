import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { anthropic } from "@/lib/anthropic";

export async function GET() {
  const results: Record<string, string> = {};

  try {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.getSession();
    results.supabase = error ? `error: ${error.message}` : "ok";
  } catch (err) {
    results.supabase = `error: ${(err as Error).message}`;
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 10,
      messages: [{ role: "user", content: "Say 'ok'." }],
    });
    results.anthropic = message.content[0].type === "text" ? "ok" : "unexpected response";
  } catch (err) {
    results.anthropic = `error: ${(err as Error).message}`;
  }

  return NextResponse.json(results);
}
