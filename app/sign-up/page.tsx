"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { AuthCard, AuthInput, AuthError, AuthButton } from "../AuthCard";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard heading="Check your email">
        <p style={{ fontSize: 13.5, color: "#6b5a70", lineHeight: 1.6, textAlign: "center" }}>
          We sent a confirmation link to <b>{email}</b>. Click it, then come back and sign in.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard heading="Create your account">
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <AuthInput
              label="First name"
              type="text"
              required
              placeholder="Alex"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <AuthInput
              label="Last name"
              type="text"
              required
              placeholder="Morgan"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
        <AuthInput
          label="Email"
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthInput
          label="Password"
          type="password"
          required
          minLength={6}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <AuthError message={error} />}
        <AuthButton type="submit" loading={loading} loadingText="Creating account…">
          Create account
        </AuthButton>
      </form>
      <p className="fine-print">
        Free — no card required. Already have an account? <a href="/sign-in">Sign in</a>.
      </p>
    </AuthCard>
  );
}
