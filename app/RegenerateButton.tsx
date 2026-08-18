"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegenerateButton({ hasRecommendation }: { hasRecommendation: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/ai-insight/regenerate", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.refresh();
  }

  return (
    <div style={{ marginTop: 10 }}>
      <button className="btn-secondary" onClick={handleClick} disabled={loading}>
        {loading ? "Generating…" : hasRecommendation ? "Regenerate" : "Generate now"}
      </button>
      {error && <p className="error-text" style={{ marginTop: 8 }}>{error}</p>}
    </div>
  );
}
