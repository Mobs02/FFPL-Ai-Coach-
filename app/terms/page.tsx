export default function Terms() {
  return (
    <div className="wrap-narrow">
      <header className="app-header">
        <div className="navrow">
          <div className="brand-mark">HQ</div>
          <div style={{ fontFamily: "var(--font-poppins)", fontWeight: 600, fontSize: 16 }}>Terms</div>
          <a className="back-link" href="/">
            ← Back to dashboard
          </a>
        </div>
      </header>
      <div className="section">
        <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "#4a3a4d" }}>
          Squad HQ is a free, unofficial companion tool for Fantasy Premier League and is not affiliated with,
          endorsed by, or connected to the Premier League or Fantasy Premier League. Squad and points data comes
          from FPL&apos;s own public API and may occasionally be delayed or unavailable if that service changes or has
          issues. AI-generated suggestions are provided for informational purposes only — you make and are
          responsible for every transfer and squad decision yourself. Use of this app is at your own discretion; it
          is provided as-is, with no warranty of accuracy or availability.
        </p>
      </div>
    </div>
  );
}
