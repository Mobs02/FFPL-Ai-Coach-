import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Session-aware client for routes acting on behalf of the signed-in user
// (/api/team, /api/leagues, /api/onboarding). Respects Row Level Security —
// a user can only ever read their own rows through this client, which is
// what actually makes the RLS policies meaningful rather than just
// theoretical.
export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component; ignore if proxy.ts is
            // refreshing the session instead.
          }
        },
      },
    },
  );
}
