"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddLeagueForm() {
  const router = useRouter();
  const [leagueId, setLeagueId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/account/leagues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leagueId: Number(leagueId) }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setLeagueId("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="number"
          required
          placeholder="Add a league ID"
          value={leagueId}
          onChange={(e) => setLeagueId(e.target.value)}
        />
        <button type="submit" className="btn-secondary" disabled={loading}>
          {loading ? "Adding…" : "Add"}
        </button>
      </div>
      {error && <p className="error-text" style={{ marginTop: 0 }}>{error}</p>}
    </form>
  );
}
