"use client";

import { useState } from "react";
import { AuthCard, AuthInput, AuthButton } from "../AuthCard";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard title="Check your email">
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          If an account exists for <span className="font-medium">{email}</span>, a password reset link is on its
          way.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset password" subtitle="We'll email you a reset link">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthInput
          label="Email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthButton type="submit" loading={loading} loadingText="Sending…">
          Send reset link
        </AuthButton>
      </form>
    </AuthCard>
  );
}
