"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function AppNav({ active }: { active: "dashboard" | "settings" }) {
  const router = useRouter();

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <nav className="wp-nav site-nav">
      <a href="/dashboard" className="wp-nav-brand auth-nav-brand">
        <img src="/logo-stacked-white.png" alt="SquadScout AI" />
      </a>
      <div className="wp-nav-links">
        {active !== "dashboard" && (
          <a className="wp-link" href="/dashboard">
            Dashboard
          </a>
        )}
        {active !== "settings" && (
          <a className="wp-link" href="/settings">
            Settings
          </a>
        )}
        <button className="wp-btn wp-btn-ghost" type="button" onClick={signOut}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
