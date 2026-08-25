import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Supabase's own session/refresh-token lifetime has no inactivity limit on
// the free tier (that's a Pro-only dashboard setting) — so we track it
// ourselves. `last_active` is a plain, non-sensitive timestamp cookie,
// separate from Supabase's own auth cookies; it's the only thing this file
// reads or writes for that purpose.
// Overridable via env for local testing (e.g. a short value to verify the
// sign-out actually fires without waiting 48 real hours) — falls back to the
// real 48-hour default whenever the env var isn't set.
const INACTIVITY_TIMEOUT_MS = Number(process.env.INACTIVITY_TIMEOUT_MS) || 48 * 60 * 60 * 1000;

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refreshes the session cookie if needed; required for server components
  // to read a valid session.
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const lastActive = request.cookies.get("last_active")?.value;
    const idleFor = lastActive ? Date.now() - Number(lastActive) : 0;

    if (lastActive && idleFor > INACTIVITY_TIMEOUT_MS) {
      // Stale beyond the window — sign out server-side (revokes the
      // refresh token too, not just this cookie) so every page's own
      // getUser() check sees no session and redirects to /sign-in.
      await supabase.auth.signOut();
      response.cookies.delete("last_active");
    } else {
      // maxAge is deliberately NOT tied to INACTIVITY_TIMEOUT_MS — that was
      // the actual bug: with maxAge == the timeout, the browser itself
      // deleted the cookie at exactly the threshold, so by the time a
      // request arrived to check it, `lastActive` read as missing rather
      // than stale, and the "no cookie" branch treated it as a fresh
      // session instead of an expired one. This value only needs to outlive
      // the timeout by a comfortable margin — 400 days is the browser's own
      // cap on cookie lifetime, so it's effectively "don't let the browser
      // be the one that expires this."
      response.cookies.set("last_active", String(Date.now()), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 400 * 24 * 60 * 60,
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
