"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard, AuthInput, AuthError, AuthButton } from "../AuthCard";

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
    <AuthCard title="Link your FPL team">
      <p className="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Log into fantasy.premierleague.com → Points — the number in the URL
        (<code className="text-xs">.../entry/1234567/event/7</code>) is your manager ID.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthInput
          label="FPL manager ID"
          type="number"
          required
          placeholder="1234567"
          value={fplManagerId}
          onChange={(e) => setFplManagerId(e.target.value)}
        />
        {error && <AuthError message={error} />}
        <AuthButton type="submit" loading={loading} loadingText="Checking…">
          Continue
        </AuthButton>
      </form>
    </AuthCard>
  );
}
