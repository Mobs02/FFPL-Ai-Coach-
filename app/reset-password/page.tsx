"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { AuthCard, AuthInput, AuthError, AuthButton } from "../AuthCard";

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/sign-in"), 1500);
  }

  if (done) {
    return (
      <AuthCard heading="Password updated">
        <p style={{ fontSize: 13.5, color: "#6b5a70", textAlign: "center" }}>Redirecting to sign in…</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard heading="Set a new password">
      <form onSubmit={handleSubmit}>
        <AuthInput
          label="New password"
          type="password"
          required
          minLength={6}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <AuthError message={error} />}
        <AuthButton type="submit" loading={loading} loadingText="Updating…">
          Update password
        </AuthButton>
      </form>
    </AuthCard>
  );
}
