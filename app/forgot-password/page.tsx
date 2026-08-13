"use client";

import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
  }

  if (sent) {
    return (
      <main className="mx-auto max-w-sm p-8">
        <h1 className="mb-4 text-2xl font-bold text-[#37003c] dark:text-purple-200">Check your email</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          If an account exists for {email}, a password reset link is on its way.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm p-8">
      <h1 className="mb-6 text-2xl font-bold text-[#37003c] dark:text-purple-200">Reset password</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-black/10 p-3 dark:border-white/10 dark:bg-zinc-900"
        />
        <button type="submit" className="rounded-lg bg-[#37003c] p-3 font-medium text-white">
          Send reset link
        </button>
      </form>
    </main>
  );
}
