"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { AuthInput, AuthError, AuthButton } from "../AuthCard";
import { PitchIllustration } from "../PitchIllustration";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen bg-white dark:bg-zinc-950">
      <div className="hidden w-1/2 md:block">
        <PitchIllustration />
      </div>

      <div className="flex w-full items-center justify-center p-8 md:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center md:text-left">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#37003c] text-lg font-bold text-white md:mx-0">
              SQ
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Sign in to Squad HQ</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AuthInput
              label="Email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <AuthInput
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <AuthError message={error} />}
            <AuthButton type="submit" loading={loading} loadingText="Signing in…">
              Sign in
            </AuthButton>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2 text-sm md:items-start">
            <a href="/forgot-password" className="text-zinc-500 hover:text-[#37003c] dark:text-zinc-400">
              Forgot password?
            </a>
            <p className="text-zinc-500 dark:text-zinc-400">
              No account?{" "}
              <a href="/sign-up" className="font-medium text-[#37003c] hover:underline dark:text-purple-300">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
