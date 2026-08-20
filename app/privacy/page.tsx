import { SiteNav } from "../SiteNav";
import { SiteFooter } from "../SiteFooter";

export default function Privacy() {
  return (
    <>
      <SiteNav />
      <main className="legal-page">
        <div className="legal-card">
          <h1>Privacy Policy</h1>
          <p className="legal-updated">Last updated: 18 August 2026</p>

          <p>
            SquadScout AI (&quot;the app&quot;, &quot;we&quot;, &quot;us&quot;) is a personal Fantasy Premier League
            companion tool. This policy explains what data we collect, why, and what rights you have over it.
          </p>
          <p>
            SquadScout AI is not affiliated with, endorsed by, or connected to the Premier League, the Football
            Association, or Fantasy Premier League. It&apos;s an independent, unofficial companion built on Fantasy
            Premier League&apos;s public data.
          </p>

          <h2>1. What we collect</h2>
          <table>
            <tbody>
              <tr>
                <th>Data</th>
                <th>Why we collect it</th>
              </tr>
              <tr>
                <td>Email address</td>
                <td>Used for sign-in (Supabase Auth) and, if you opt in, deadline reminder emails</td>
              </tr>
              <tr>
                <td>Password</td>
                <td>Never stored by us directly — handled and hashed by Supabase Auth</td>
              </tr>
              <tr>
                <td>FPL manager ID</td>
                <td>Public identifier you provide, used to fetch your squad and points from the official Fantasy Premier League API</td>
              </tr>
              <tr>
                <td>League IDs</td>
                <td>Public identifiers you provide, used to show your mini-league standings</td>
              </tr>
              <tr>
                <td>Squad, points, and rank data</td>
                <td>Pulled from Fantasy Premier League&apos;s public API for your manager ID, stored so the dashboard loads quickly without hitting FPL&apos;s servers on every visit</td>
              </tr>
              <tr>
                <td>AI recommendations we generate for you</td>
                <td>Stored so you&apos;re not charged/waiting for a fresh AI call every time you open the app</td>
              </tr>
              <tr>
                <td>Your feedback on AI suggestions (👍/👎)</td>
                <td>If you use this feature, stored against the recommendation it relates to</td>
              </tr>
              <tr>
                <td>Email reminder preference</td>
                <td>Whether you&apos;ve opted in or out of deadline reminder emails</td>
              </tr>
            </tbody>
          </table>
          <p className="legal-note">
            We do not collect payment details, precise location, device identifiers for advertising, or any data
            beyond what&apos;s listed above.
          </p>

          <h2>2. How your data is used</h2>
          <ul>
            <li>To show your squad, points, and league standings on your dashboard.</li>
            <li>To generate AI-powered transfer, captain, and chip suggestions.</li>
            <li>To send you an optional email before each gameweek deadline, if you&apos;ve turned this on.</li>
            <li>To keep your account secure and functioning (sign-in, password reset).</li>
          </ul>
          <p>We do not use your data for advertising, and we do not sell or rent your data to anyone.</p>

          <h2>3. Who else sees your data</h2>
          <p>
            SquadScout AI runs on a small number of third-party services that process data on our behalf, strictly
            to run the app:
          </p>
          <table>
            <tbody>
              <tr>
                <th>Service</th>
                <th>What it handles</th>
              </tr>
              <tr>
                <td>Supabase</td>
                <td>Hosts our database and handles sign-in/authentication. Your email, manager ID, squad data, and AI recommendations are stored here.</td>
              </tr>
              <tr>
                <td>Vercel</td>
                <td>Hosts the website and runs the backend code that talks to Supabase and the FPL API.</td>
              </tr>
              <tr>
                <td>Anthropic (Claude API)</td>
                <td>Your squad, points, and budget data are sent to Anthropic&apos;s API to generate your AI recommendations. Anthropic processes this data to generate a response and does not use it to advertise to you.</td>
              </tr>
              <tr>
                <td>Resend</td>
                <td>If you&apos;ve opted into deadline reminder emails, your email address and a short summary of your squad status are sent here to deliver that email.</td>
              </tr>
              <tr>
                <td>GitHub Actions</td>
                <td>Triggers our scheduled data refresh. It does not handle your personal data directly — it only calls our own backend on a timer.</td>
              </tr>
            </tbody>
          </table>
          <p className="legal-note">
            Some of these providers may process data on servers outside the UK/EEA. Each operates under its own
            privacy and security standards; we&apos;ve chosen providers with a general reputation for security, but
            we don&apos;t control their infrastructure directly.
          </p>
          <p>
            We never expose your data to other users beyond what you&apos;d expect from a mini-league feature (e.g.
            your public FPL rank being visible to others in the same public FPL league — that&apos;s already true on
            the official site, not something SquadScout AI adds).
          </p>

          <h2>4. How long we keep it</h2>
          <p>
            We keep your data for as long as your account exists. If you delete your account (Settings → Delete
            account), your email, manager ID, stored squad snapshots, league snapshots, and AI recommendations are
            permanently deleted immediately — this is enforced at the database level, not just hidden from view.
          </p>

          <h2>5. Your rights</h2>
          <p>You can, at any time:</p>
          <ul>
            <li>View your current data through the app itself.</li>
            <li>Download a copy of your stored data via Settings → Download my data.</li>
            <li>Correct your FPL manager ID or league list via the app.</li>
            <li>Delete your account and all associated data via Settings → Delete account.</li>
            <li>Opt out of deadline reminder emails via Settings → Notifications, or the unsubscribe link in any reminder email.</li>
          </ul>
          <p>
            If you&apos;re in the UK or EU, these map onto your rights under UK GDPR / the EU GDPR (access,
            rectification, erasure, and objection to processing). To exercise any of these beyond what the app&apos;s
            settings page offers, contact us at <a href="mailto:squadscoutai@gmail.com">squadscoutai@gmail.com</a>.
          </p>

          <h2>6. Cookies</h2>
          <p>
            We use only the essential session cookie set by Supabase Auth to keep you signed in. We do not use
            tracking, analytics, or advertising cookies.
          </p>

          <h2>7. Children</h2>
          <p>
            SquadScout AI isn&apos;t directed at children and isn&apos;t intended for use by anyone under 16. We
            don&apos;t knowingly collect data from children.
          </p>

          <h2>8. Security</h2>
          <p>
            We use Supabase&apos;s Row Level Security so that your data is only ever readable by your own signed-in
            account, and all traffic is encrypted in transit (HTTPS). No system is perfectly secure, and we
            can&apos;t guarantee absolute security, but we take reasonable, standard precautions.
          </p>

          <h2>9. Changes to this policy</h2>
          <p>
            We may update this policy as the app changes. Material changes will be reflected here with an updated
            date at the top.
          </p>

          <h2>10. Contact</h2>
          <p>
            Questions about this policy or your data: <a href="mailto:squadscoutai@gmail.com">squadscoutai@gmail.com</a>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
