export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#37003c] to-[#1a0020] p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl dark:bg-zinc-900">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#37003c] text-lg font-bold text-white">
            SQ
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
        </div>
        {children}
      </div>
    </main>
  );
}

export function AuthInput({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</label>
      <input
        {...props}
        className="w-full rounded-lg border border-zinc-200 p-3 text-sm outline-none transition focus:border-[#37003c] focus:ring-2 focus:ring-[#37003c]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
      />
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">{message}</p>
  );
}

export function AuthButton({
  loading,
  loadingText,
  children,
  ...props
}: { loading?: boolean; loadingText?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="mt-2 rounded-lg bg-[#37003c] p-3 text-sm font-semibold text-white transition hover:bg-[#4a0050] disabled:opacity-50"
    >
      {loading ? loadingText ?? "Loading…" : children}
    </button>
  );
}
