"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { SiteFooter } from "../SiteFooter";

type League = { id: number; name: string; rank: number | null };

export function SettingsClient({
  email,
  fplManagerId,
  leagues,
  emailRemindersEnabled,
}: {
  email: string;
  fplManagerId: number;
  leagues: League[];
  emailRemindersEnabled: boolean;
}) {
  const router = useRouter();
  const [reminders, setReminders] = useState(emailRemindersEnabled);
  const [newLeagueId, setNewLeagueId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function toggleReminders() {
    const next = !reminders;
    setReminders(next);
    await fetch("/api/account/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    });
  }

  async function removeLeague(leagueId: number) {
    setBusy(`remove-${leagueId}`);
    await fetch("/api/account/leagues", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leagueId }),
    });
    setBusy(null);
    router.refresh();
  }

  async function addLeague(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy("add-league");
    const res = await fetch("/api/account/leagues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leagueId: Number(newLeagueId) }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setNewLeagueId("");
    router.refresh();
  }

  async function downloadData() {
    setBusy("export");
    const res = await fetch("/api/account/export");
    const data = await res.json();
    setBusy(null);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "squad-hq-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  async function deleteAccount() {
    if (!confirm("This permanently deletes your account and all stored data. This cannot be undone. Continue?")) {
      return;
    }
    setBusy("delete");
    const res = await fetch("/api/account/delete", { method: "POST" });
    setBusy(null);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <>
      <div className="section">
        <h2>Account</h2>
        <div className="setting-row">
          <div className="row-label">Email</div>
          <div className="row-value">{email}</div>
        </div>
        <div className="setting-row">
          <div>
            <div className="row-label">FPL manager ID</div>
            <div className="row-sub">Used to pull your squad — public, no FPL login stored</div>
          </div>
          <div className="row-value">{fplManagerId}</div>
        </div>
        <div className="setting-row">
          <div className="row-label">Signed in</div>
          <button className="btn-secondary" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>

      <div className="section">
        <h2>Your leagues</h2>
        {leagues.map((league) => (
          <div className="setting-row" key={league.id}>
            <div>
              <div className="row-label">{league.name}</div>
              {league.rank != null && <div className="row-sub">Rank {league.rank}</div>}
            </div>
            <button className="btn-remove" disabled={busy === `remove-${league.id}`} onClick={() => removeLeague(league.id)}>
              {busy === `remove-${league.id}` ? "Removing…" : "Remove"}
            </button>
          </div>
        ))}
        <form className="add-league-row" onSubmit={addLeague}>
          <input
            type="number"
            required
            placeholder="Add a league ID"
            value={newLeagueId}
            onChange={(e) => setNewLeagueId(e.target.value)}
          />
          <button className="btn-secondary" type="submit" disabled={busy === "add-league"}>
            {busy === "add-league" ? "Adding…" : "Add"}
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="section">
        <h2>Notifications</h2>
        <div className="setting-row">
          <div>
            <div className="row-label">Deadline email reminders</div>
            <div className="row-sub">Sent ~24 hours before each gameweek deadline</div>
          </div>
          <button className={`toggle ${reminders ? "" : "off"}`} onClick={toggleReminders} aria-label="Toggle deadline reminders" />
        </div>
      </div>

      <div className="section">
        <h2>Your data</h2>
        <div className="setting-row">
          <div>
            <div className="row-label">Download my data</div>
            <div className="row-sub">Your squad history and AI recommendations, as JSON</div>
          </div>
          <button className="btn-secondary" onClick={downloadData} disabled={busy === "export"}>
            {busy === "export" ? "Preparing…" : "Download"}
          </button>
        </div>
      </div>

      <div className="section danger">
        <h2>Danger zone</h2>
        <div className="danger-row">
          <div>
            <div className="row-label">Delete my account</div>
            <div className="row-sub">Removes your account and all stored data. Cannot be undone.</div>
          </div>
          <button className="btn-danger" onClick={deleteAccount} disabled={busy === "delete"}>
            {busy === "delete" ? "Deleting…" : "Delete account"}
          </button>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
