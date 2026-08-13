export default function Privacy() {
  return (
    <div className="wrap-narrow">
      <header className="app-header">
        <div className="navrow">
          <div className="brand-mark">HQ</div>
          <div style={{ fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: 16 }}>Privacy</div>
          <a className="back-link" href="/">
            ← Back to dashboard
          </a>
        </div>
      </header>
      <div className="section">
        <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "#4a3a4d" }}>
          This app stores your email address (for sign-in) and your public FPL manager ID. Your squad and points data
          is fetched from the public Fantasy Premier League API. AI recommendations are generated using the
          Anthropic API, using only your squad and points data. You can delete your account and all associated data
          at any time from your settings page.
        </p>
      </div>
    </div>
  );
}
