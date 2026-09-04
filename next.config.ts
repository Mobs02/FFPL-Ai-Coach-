import { withSentryConfig } from "@sentry/nextjs/config";
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
  `connect-src 'self' https://*.supabase.co https://*.ingest.de.sentry.io https://*.ingest.sentry.io${isDev ? " ws://localhost:* wss://localhost:*" : ""}`,
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

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "omar-i3",

  project: "ffpl-ai-coach",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
