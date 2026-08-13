import { createClient } from "@supabase/supabase-js";

// Service-role client — full access, bypasses Row Level Security entirely.
// Only ever used in server-only routes that already gate access another way
// (cron jobs checking CRON_SECRET, admin routes). Never expose this client,
// or the service-role key it uses, to anything user-facing.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
