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
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthCard heading="Add your FPL team" stepTag="Step 2 of 2">
      <form onSubmit={handleSubmit}>
        <AuthInput
          label="Your FPL manager ID"
          type="number"
          required
          placeholder="e.g. 1234567"
          value={fplManagerId}
          onChange={(e) => setFplManagerId(e.target.value)}
        />
        {error && <AuthError message={error} />}
        <AuthButton type="submit" loading={loading} loadingText="Checking…">
          Save and continue
        </AuthButton>
      </form>
      <div className="helper-box">
        <b>Where to find this:</b> log into fantasy.premierleague.com, open &quot;Points&quot; (or &quot;Pick Team&quot;
        before the season starts), and look at the URL — the number in <code>/entry/1234567/</code> is your manager
        ID. No FPL password needed, this number is public.
      </div>
    </AuthCard>
  );
}
