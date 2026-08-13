import { NextResponse } from "next/server";
import { getLeagueStandings } from "@/lib/fpl";
import { supabase } from "@/lib/supabase"; // service-role — no UPDATE policy exists on `managers`, so this needs to bypass RLS
import { getSupabaseServerClient } from "@/lib/supabase-server";

async function getSessionUserId(): Promise<string | null> {
  const sessionClient = await getSupabaseServerClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  return user?.id ?? null;
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { leagueId } = await request.json();
  try {
    await getLeagueStandings(leagueId); // throws if the league doesn't exist
  } catch {
    return NextResponse.json({ error: "We couldn't find that league ID." }, { status: 400 });
  }

  const { data: manager } = await supabase.from("managers").select("league_ids").eq("id", userId).single();
  const updated = [...new Set([...(manager?.league_ids ?? []), leagueId])]; // dedupe if already added
  const { error } = await supabase.from("managers").update({ league_ids: updated }).eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, leagueIds: updated });
}

export async function DELETE(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { leagueId } = await request.json();
  const { data: manager } = await supabase.from("managers").select("league_ids").eq("id", userId).single();
  const updated = (manager?.league_ids ?? []).filter((id: number) => id !== leagueId);
  const { error } = await supabase.from("managers").update({ league_ids: updated }).eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, leagueIds: updated });
}
