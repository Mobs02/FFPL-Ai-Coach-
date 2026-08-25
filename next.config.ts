import type { NextConfig } from "next";

// Scoped to what this app actually loads: next/font/google self-hosts fonts
// at build time (no runtime fonts.googleapis.com request), player photos come
// from resources.premierleague.com, and the browser-side Supabase client
// talks directly to *.supabase.co for auth. No inline <script>/<style> tags
// are used beyond Next's own hydration bootstrap, hence 'unsafe-inline' on
// script-src/style-src rather than a nonce setup.
// React's dev mode needs eval() for its debugging features (call-stack
// reconstruction across the dev overlay) — never used in production, per
// React's own docs, so this only loosens script-src locally.
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://resources.premierleague.com",
  "font-src 'self' data:",
  // ws(s)://'self' host covers Next's dev-mode HMR socket — 'self' alone
  // doesn't match a different scheme (ws vs https) even on the same host.
  `connect-src 'self' https://*.supabase.co${isDev ? " ws://localhost:* wss://localhost:*" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
