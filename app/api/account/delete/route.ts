import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSupabaseServerClient } from "@/lib/supabase-server";

// `on delete cascade` in the schema does the hard part — deleting the auth
// user automatically removes their rows from managers, gameweek_snapshots,
// league_snapshots, and ai_recommendations too. This route just triggers it.
export async function POST() {
  const sessionClient = await getSupabaseServerClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { error } = await supabase.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
