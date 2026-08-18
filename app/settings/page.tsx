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
  if (!manager) redirect("/onboarding");

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
