import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const { email } = await request.json();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });
  // Always return success, even if the email doesn't exist — confirming
  // which emails have accounts is a real information leak worth avoiding.
  if (error) console.error(error);
  return NextResponse.json({ ok: true });
}
