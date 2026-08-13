"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();
  const [fplManagerId, setFplManagerId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fplManagerId: Number(fplManagerId) }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-sm p-8">
      <h1 className="mb-2 text-2xl font-bold text-[#37003c] dark:text-purple-200">Link your FPL team</h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Log into fantasy.premierleague.com → Points — the number in the URL
        (<code>.../entry/1234567/event/7</code>) is your manager ID.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="number"
          required
          placeholder="FPL manager ID"
          value={fplManagerId}
          onChange={(e) => setFplManagerId(e.target.value)}
          className="rounded-lg border border-black/10 p-3 dark:border-white/10 dark:bg-zinc-900"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#37003c] p-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Checking…" : "Continue"}
        </button>
      </form>
    </main>
  );
}
