import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { serverErrorResponse } from "@/lib/api-error";

const bodySchema = z.object({ enabled: z.boolean() });

export async function PATCH(request: Request) {
  const sessionClient = await getSupabaseServerClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { error } = await supabase.from("managers").update({ email_reminders_enabled: parsed.data.enabled }).eq("id", user.id);
  if (error) return serverErrorResponse("account/notifications", error);
  return NextResponse.json({ ok: true });
}
