import { NextResponse } from "next/server";
import { z } from "zod";
import { getLeagueStandings } from "@/lib/fpl";
import { supabase } from "@/lib/supabase"; // service-role — no UPDATE policy exists on `managers`, so this needs to bypass RLS
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { serverErrorResponse } from "@/lib/api-error";
import { checkRateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({ leagueId: z.coerce.number().int().positive() });

async function getSessionUserId(): Promise<string | null> {
  const sessionClient = await getSupabaseServerClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  return user?.id ?? null;
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  if (!checkRateLimit(`add-league:${userId}`, { max: 5, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many attempts. Wait a moment and try again." }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid league ID (numbers only)." }, { status: 400 });
  }
  const { leagueId } = parsed.data;

  try {
    await getLeagueStandings(leagueId); // throws if the league doesn't exist
  } catch {
    return NextResponse.json({ error: "We couldn't find that league ID." }, { status: 400 });
  }

  const { data: manager } = await supabase.from("managers").select("league_ids").eq("id", userId).single();
  const updated = [...new Set([...(manager?.league_ids ?? []), leagueId])]; // dedupe if already added
  const { error } = await supabase.from("managers").update({ league_ids: updated }).eq("id", userId);
  if (error) return serverErrorResponse("account/leagues POST", error);
  return NextResponse.json({ ok: true, leagueIds: updated });
}

export async function DELETE(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid league ID." }, { status: 400 });
  }
  const { leagueId } = parsed.data;

  const { data: manager } = await supabase.from("managers").select("league_ids").eq("id", userId).single();
  const updated = (manager?.league_ids ?? []).filter((id: number) => id !== leagueId);
  const { error } = await supabase.from("managers").update({ league_ids: updated }).eq("id", userId);
  if (error) return serverErrorResponse("account/leagues DELETE", error);
  return NextResponse.json({ ok: true, leagueIds: updated });
}
