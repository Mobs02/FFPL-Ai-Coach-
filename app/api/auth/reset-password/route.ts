import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { checkRateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  // Always return the same generic success shape on bad input too — a
  // format-validation error would otherwise be a second way to fingerprint
  // requests, undermining the point of the constant "ok" response below.
  if (!parsed.success) return NextResponse.json({ ok: true });
  const { email } = parsed.data;

  // Extra layer on top of Supabase Auth's own platform-level rate limiting,
  // keyed by email rather than IP so it can't be trivially bypassed.
  if (!checkRateLimit(`reset-password:${email.toLowerCase()}`, { max: 3, windowMs: 10 * 60_000 })) {
    return NextResponse.json({ ok: true });
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });
  // Always return success, even if the email doesn't exist — confirming
  // which emails have accounts is a real information leak worth avoiding.
  if (error) console.error("[reset-password]", error.message);
  return NextResponse.json({ ok: true });
}
