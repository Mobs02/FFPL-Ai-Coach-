import { SiteNav } from "../SiteNav";

export default function Privacy() {
  return (
    <>
      <SiteNav />
      <main className="legal-page">
        <div className="legal-card">
          <h1>Privacy</h1>
          <p>
            This app stores your email address (for sign-in) and your public FPL manager ID. Your squad and points
            data is fetched from the public Fantasy Premier League API. AI recommendations are generated using the
            Anthropic API, using only your squad and points data. You can delete your account and all associated
            data at any time from your settings page.
          </p>
        </div>
      </main>
    </>
  );
}
