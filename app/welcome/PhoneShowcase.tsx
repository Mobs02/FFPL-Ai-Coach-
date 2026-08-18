"use client";

import { useRef } from "react";
import { motion, useScroll } from "motion/react";

function DashboardPhoneContent() {
  return (
    <div>
      <header className="app-header">
        <div className="navrow">
          <div className="brand">
            <img src="/logo-icon.png" alt="" className="brand-mark" />
            SquadScout AI
          </div>
          <div className="gw-pill">GW 7</div>
        </div>
        <div className="status-row">
          <span className="status-chip fresh">Live</span>
        </div>
      </header>
      <div className="stats-strip">
        <div>
          <p className="stat-label">GW pts</p>
          <p className="stat-value">75</p>
        </div>
        <div>
          <p className="stat-label">Rank</p>
          <p className="stat-value">189k</p>
        </div>
        <div>
          <p className="stat-label">Total</p>
          <p className="stat-value">421</p>
        </div>
      </div>
      <div className="pitch" style={{ minHeight: 260, padding: "16px 8px" }}>
        <div className="pitch-row">
          <div className="shirt">
            <div className="jersey" />
            <div className="p-name">Saka</div>
            <div className="p-pts">12</div>
          </div>
          <div className="shirt">
            <span className="cap-badge">C</span>
            <div className="jersey" />
            <div className="p-name">Haaland</div>
            <div className="p-pts">18</div>
          </div>
          <div className="shirt">
            <div className="jersey" />
            <div className="p-name">Palmer</div>
            <div className="p-pts">9</div>
          </div>
        </div>
        <div className="pitch-row">
          <div className="shirt">
            <div className="jersey" />
            <div className="p-name">Wirtz</div>
            <div className="p-pts">7</div>
          </div>
          <div className="shirt">
            <div className="jersey" />
            <div className="p-name">Rice</div>
            <div className="p-pts">6</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignInPhoneContent() {
  return (
    <div style={{ padding: "40px 0" }}>
      <div className="center-card">
        <div className="brand-row">
          <img src="/logo-icon.png" alt="" className="brand-mark" />
          <div className="brand-name">SquadScout AI</div>
        </div>
        <div className="field-label">Email</div>
        <input className="field" readOnly value="you@email.com" />
        <div className="field-label">Password</div>
        <input className="field" readOnly value="••••••••" />
        <button className="btn-primary" type="button">
          Sign in
        </button>
        <p className="fine-print">No account? Sign up</p>
      </div>
    </div>
  );
}

export function PhoneShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  // Scroll-linked, like the rest of the spiral thread further down the page
  // — draws in as the hero scrolls past, rather than a one-shot reveal.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <div className="wp-phones" ref={ref}>
      <svg viewBox="0 0 640 500" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <linearGradient id="wp-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5dffb0" />
            <stop offset="100%" stopColor="#00c96b" />
          </linearGradient>
          <filter id="wp-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <motion.path
          d="M 170 80 C 340 30, 320 420, 480 400"
          fill="none"
          stroke="url(#wp-glow)"
          strokeWidth="10"
          strokeLinecap="round"
          filter="url(#wp-blur)"
          opacity={0.55}
          style={{ pathLength: scrollYProgress }}
        />
        <motion.path
          d="M 170 80 C 340 30, 320 420, 480 400"
          fill="none"
          stroke="url(#wp-glow)"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ pathLength: scrollYProgress }}
        />
      </svg>

      <motion.div
        className="wp-phone wp-phone-left"
        initial={{ opacity: 0, y: 40, rotate: -9 }}
        whileInView={{ opacity: 1, y: 0, rotate: -9 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="wp-phone-notch" />
        <div className="wp-phone-screen">
          <SignInPhoneContent />
        </div>
      </motion.div>

      <motion.div
        className="wp-phone wp-phone-right"
        initial={{ opacity: 0, y: 40, rotate: 7 }}
        whileInView={{ opacity: 1, y: 0, rotate: 7 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
      >
        <div className="wp-phone-notch" />
        <div className="wp-phone-screen">
          <DashboardPhoneContent />
        </div>
      </motion.div>
    </div>
  );
}
