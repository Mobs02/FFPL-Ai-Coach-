export function AuthCard({
  title,
  stepTag,
  children,
}: {
  title: string;
  stepTag?: string;
  children: React.ReactNode;
}) {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div className="center-card">
        {stepTag && <span className="step-tag">{stepTag}</span>}
        <div className="brand-row">
          <div className="brand-mark">HQ</div>
          <div className="brand-name">{title}</div>
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
      <div className="field-label">{label}</div>
      <input {...props} className="field" />
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return <p className="error-text">{message}</p>;
}

export function AuthButton({
  loading,
  loadingText,
  children,
  ...props
}: { loading?: boolean; loadingText?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} disabled={loading || props.disabled} className="btn-primary">
      {loading ? loadingText ?? "Loading…" : children}
    </button>
  );
}
