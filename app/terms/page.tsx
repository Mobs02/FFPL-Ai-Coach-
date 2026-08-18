import { SiteNav } from "../SiteNav";
import { SiteFooter } from "../SiteFooter";

export default function Terms() {
  return (
    <>
      <SiteNav />
      <main className="legal-page">
        <div className="legal-card">
          <h1>Terms</h1>
          <p>
            SquadScout AI is a free, unofficial companion tool for Fantasy Premier League and is not affiliated
            with, endorsed by, or connected to the Premier League or Fantasy Premier League. Squad and points data
            comes from FPL&apos;s own public API and may occasionally be delayed or unavailable if that service
            changes or has issues. AI-generated suggestions are provided for informational purposes only — you make
            and are responsible for every transfer and squad decision yourself. Use of this app is at your own
            discretion; it is provided as-is, with no warranty of accuracy or availability.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
