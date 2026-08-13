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
    // Supabase's client-side SDK exchanges the reset link's token for a
    // session automatically on this page load.
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
      <AuthCard title="Password updated">
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">Redirecting to sign in…</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthInput
          label="New password"
          type="password"
          required
          minLength={6}
          placeholder="At least 6 characters"
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
