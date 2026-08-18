import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";

export function AuthCard({
  heading,
  stepTag,
  children,
}: {
  heading?: string;
  stepTag?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteNav />
      <main className="auth-page">
        <img src="/home-page-banner.png" alt="" className="auth-bg-banner" />
        <div className="auth-card-wrap">
        <div className="center-card">
          {stepTag && <span className="step-tag">{stepTag}</span>}
          <div className="brand-row">
            <img src="/logo-icon.png" alt="" className="brand-mark" />
            <div className="brand-name">SquadScout AI</div>
          </div>
          {heading && (
            <p style={{ textAlign: "center", fontSize: 13.5, color: "#6b5a70", margin: "-14px 0 18px" }}>{heading}</p>
          )}
          {children}
        </div>
        </div>
      </main>
      <SiteFooter />
    </>
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
