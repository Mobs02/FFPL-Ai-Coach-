import { createBrowserClient } from "@supabase/ssr";

// Client-side session-aware client, for sign-in/sign-up forms and anything
// else that runs in the browser. Respects Row Level Security, same as
// lib/supabase-server.ts's getSupabaseServerClient().
export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
