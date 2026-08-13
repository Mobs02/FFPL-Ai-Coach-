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
      <AuthCard title="Squad HQ">
        <p style={{ fontSize: 13.5, color: "#6b5a70", lineHeight: 1.6, textAlign: "center" }}>
          If an account exists for <b>{email}</b>, a password reset link is on its way.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Squad HQ">
      <form onSubmit={handleSubmit}>
        <AuthInput
          label="Email"
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthButton type="submit" loading={loading} loadingText="Sending…">
          Send reset link
        </AuthButton>
      </form>
      <p className="fine-print">
        <a href="/sign-in">Back to sign in</a>
      </p>
    </AuthCard>
  );
}
