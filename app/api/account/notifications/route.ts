import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function PATCH(request: Request) {
  const sessionClient = await getSupabaseServerClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { enabled } = await request.json();
  const { error } = await supabase.from("managers").update({ email_reminders_enabled: enabled }).eq("id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
