import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { SettingsClient } from "./SettingsClient";
import { AppNav } from "../AppNav";
import { SiteFooter } from "../SiteFooter";

export default async function Settings() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: manager } = await supabase
    .from("managers")
    .select("fpl_manager_id, league_ids, email_reminders_enabled")
    .eq("id", user.id)
    .maybeSingle();
  // No hard redirect — see the matching comment in app/dashboard/page.tsx
  // for why (FPL's mobile app has no URL bar to find a manager ID from).
  if (!manager) {
    return (
      <>
        <AppNav active="settings" />
        <main className="app-page">
          <div className="wrap-narrow">
            <div className="section" style={{ textAlign: "center" }}>
              <h2 style={{ marginBottom: 8 }}>Finish setting up your team</h2>
              <p style={{ color: "#6b5a70", fontSize: 13.5, margin: "0 0 18px" }}>
                Add your FPL manager ID to unlock your settings. It only takes a few seconds,
                and there&apos;s no FPL password needed.
              </p>
              <a className="wp-btn wp-btn-primary" href="/onboarding" style={{ textDecoration: "none" }}>
                Add your manager ID
              </a>
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const { data: leagueSnapshots } = await supabase
    .from("league_snapshots")
    .select("league_id, league_name, your_rank, gameweek")
    .eq("manager_id", user.id)
    .order("gameweek", { ascending: false });

  const latestByLeague = new Map<number, { name: string; rank: number | null }>();
  for (const row of leagueSnapshots ?? []) {
    if (!latestByLeague.has(row.league_id)) {
      latestByLeague.set(row.league_id, { name: row.league_name ?? `League ${row.league_id}`, rank: row.your_rank });
    }
  }

  const leagues = (manager.league_ids ?? []).map((id: number) => ({
    id,
    name: latestByLeague.get(id)?.name ?? `League ${id}`,
    rank: latestByLeague.get(id)?.rank ?? null,
  }));

  return (
    <>
      <AppNav active="settings" />
      <main className="app-page">
        <div className="wrap-narrow">
          <h1 style={{ fontFamily: "var(--font-poppins)", fontSize: 22, fontWeight: 700, color: "var(--purple)", margin: "0 0 22px" }}>
            Settings
          </h1>
          <SettingsClient
            email={user.email ?? ""}
            fplManagerId={manager.fpl_manager_id}
            leagues={leagues}
            emailRemindersEnabled={manager.email_reminders_enabled}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
