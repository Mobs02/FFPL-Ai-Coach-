"use client";

import { motion } from "motion/react";
import { PhoneShowcase } from "./PhoneShowcase";
import { SpiralSegment } from "./SpiralConnector";
import { SiteFooter } from "../SiteFooter";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={fadeUp.initial}
      whileInView={fadeUp.whileInView}
      viewport={fadeUp.viewport}
      transition={{ ...fadeUp.transition, delay }}
    >
      {children}
    </motion.div>
  );
}

const FEATURES = [
  {
    icon: "◆",
    title: "AI transfer suggestions",
    body: "Budget-aware recommendations that account for your actual selling prices, bank, and free transfers — not just generic \"who's in form\" advice.",
  },
  {
    icon: "▲",
    title: "Live dashboard, always current",
    body: "Your squad, points, and league standings update automatically on a schedule — no more refreshing the official site during a live gameweek.",
  },
  {
    icon: "●",
    title: "Under-the-radar picks",
    body: "Get pointed to in-form players almost nobody else has picked yet — a real edge over the crowd, not just a popular \"safe\" swap.",
  },
];

const STEPS = [
  {
    title: "Link your FPL team",
    body: "Paste in your public FPL manager ID — no password needed, it takes ten seconds.",
  },
  {
    title: "We track it automatically",
    body: "A scheduled poll keeps your squad, points, and league standings current through every gameweek.",
  },
  {
    title: "Add your mini-leagues",
    body: "Paste in a league ID from your FPL \"Leagues\" tab to see exactly where you rank and who's directly ahead of you.",
  },
  {
    title: "Get AI-powered advice",
    body: "Before each deadline, get a budget-checked transfer suggestion, captain pick, and differential watch.",
  },
];

export default function Welcome() {
  return (
    <div className="wp">
      <nav className="wp-nav">
        <div className="wp-nav-brand">
          <img src="/logo-text-blue-transparent.png" alt="SquadScout AI" />
        </div>
        <div className="wp-nav-links">
          <a className="wp-link" href="/sign-in">
            Sign in
          </a>
          <a className="wp-btn wp-btn-primary" href="/sign-up">
            Get started
          </a>
        </div>
      </nav>

      <header className="wp-hero">
        <img src="/home-page-banner.png" alt="" className="wp-hero-banner" />
        <img src="/logo-text-blue-transparent.png" alt="SquadScout AI" className="wp-hero-logo" />
        <span className="wp-hero-eyebrow">AI-powered fantasy football scout</span>
        <h1 className="wp-hero-title">
          Stop guessing. <span className="accent">Start scouting.</span>
        </h1>
        <p className="wp-hero-sub">
          SquadScout AI tracks your FPL squad automatically and gives you budget-checked, fixture-aware transfer
          advice before every deadline.
        </p>
        <div className="wp-hero-ctas">
          <a className="wp-btn wp-btn-primary wp-btn-lg" href="/sign-up">
            Get started free
          </a>
          <a className="wp-btn wp-btn-ghost" href="/sign-in" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>
            Sign in
          </a>
        </div>

        <PhoneShowcase />
      </header>

      <section className="wp-section">
        <SpiralSegment path="M 200 0 C 90 90, 70 260, 90 400" />
        <Reveal className="wp-section-head">
          <span className="wp-kicker">What you get</span>
          <h2 className="wp-h2">Built for people who take their mini-league seriously</h2>
          <p>Every suggestion is checked against your real budget and real fixtures — never a vague guess.</p>
        </Reveal>
        <div className="wp-features">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.1}>
              <div className="wp-feature-card">
                <div className="wp-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wp-section">
        <SpiralSegment path="M 90 0 C 260 90, 330 260, 340 400" />
        <Reveal className="wp-section-head">
          <img src="/logo-stacked-white.png" alt="SquadScout AI" className="wp-section-logo" />
          <span className="wp-kicker">How it works</span>
          <h2 className="wp-h2">Four steps, then it runs itself</h2>
        </Reveal>
        <div className="wp-steps">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="wp-step">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wp-section">
        <SpiralSegment path="M 340 0 C 260 100, 210 260, 200 400" />
        <Reveal className="wp-section-head">
          <span className="wp-kicker">See it in action</span>
          <h2 className="wp-h2">Your squad, points, and leagues — one screen</h2>
          <a className="wp-btn wp-btn-primary" href="/sign-up" style={{ marginTop: 18 }}>
            Get started free
          </a>
        </Reveal>
        <Reveal>
          <div className="wp-preview-wrap">
            <div className="wp-preview-frame">
              <div className="wrap">
                <header className="app-header">
                  <div className="navrow">
                    <div className="brand">
                      <img src="/logo-icon.png" alt="" className="brand-mark" />
                      SquadScout AI
                    </div>
                    <div className="gw-pill">
                      Gameweek 7 &middot; deadline in <span>1d 6h</span>
                    </div>
                  </div>
                  <div className="status-row">
                    <span className="status-chip">2 free transfers</span>
                    <span className="status-chip fresh">Updated 4m ago</span>
                  </div>
                </header>
                <div className="stats-strip">
                  <div>
                    <p className="stat-label">Gameweek points</p>
                    <p className="stat-value">75</p>
                  </div>
                  <div>
                    <p className="stat-label">Overall rank</p>
                    <p className="stat-value">189,442</p>
                  </div>
                  <div>
                    <p className="stat-label">Total points</p>
                    <p className="stat-value">421</p>
                  </div>
                </div>
                <div className="content">
                  <div className="pitch-card">
                    <div className="pitch-card-header">Your team — gameweek 7</div>
                    <div className="pitch">
                      <div className="pitch-row">
                        <div className="shirt">
                          <div className="jersey" />
                          <div className="p-name">Gabriel</div>
                          <div className="p-pts">8</div>
                        </div>
                        <div className="shirt">
                          <div className="jersey" />
                          <div className="p-name">Van Dijk</div>
                          <div className="p-pts">3</div>
                        </div>
                        <div className="shirt">
                          <div className="jersey" />
                          <div className="p-name">Trippier</div>
                          <div className="p-pts">9</div>
                        </div>
                      </div>
                      <div className="pitch-row">
                        <div className="shirt">
                          <span className="cap-badge">C</span>
                          <div className="jersey" />
                          <div className="p-name">Haaland</div>
                          <div className="p-pts">14</div>
                        </div>
                        <div className="shirt">
                          <div className="jersey" />
                          <div className="p-name">Saka</div>
                          <div className="p-pts">11</div>
                        </div>
                        <div className="shirt">
                          <div className="jersey" />
                          <div className="p-name">Palmer</div>
                          <div className="p-pts">5</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="sidebar">
                    <div className="side-card">
                      <h3>Office mini-league</h3>
                      <table className="league-table">
                        <tbody>
                          <tr>
                            <td>1. J. Adeyemi</td>
                            <td>438</td>
                          </tr>
                          <tr className="you">
                            <td>2. You</td>
                            <td>421</td>
                          </tr>
                          <tr>
                            <td>3. R. Chowdhury</td>
                            <td>405</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="ai-card">
                      <span className="ai-tag">AI suggestion</span>
                      <p>
                        <b>Sell Trippier for Porro — frees £0.5m, costs nothing.</b> Fixture run is very favourable
                        over the next 4 gameweeks.
                      </p>
                      <p>
                        <b>Differential watch:</b> Semenyo (9% owned) has strong underlying numbers and a kind run of
                        fixtures.
                      </p>
                      <p>
                        <b>Bench call:</b> your bench midfielder has outscored Van Dijk in 2 of the last 3 gameweeks —
                        worth a start.
                      </p>
                      <p>
                        <b>Captain:</b> Haaland. <b>Vice:</b> Palmer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="wp-section">
        <SpiralSegment path="M 200 0 C 200 120, 200 260, 200 380" />
        <Reveal>
          <div className="wp-cta">
            <h2>Ready to stop guessing?</h2>
            <p>Free to use — link your team in under a minute.</p>
            <a className="wp-btn wp-btn-primary wp-btn-lg" href="/sign-up">
              Get started free
            </a>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
