// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://a919df33e777bf5b364fc450f2216a13@o4512030001659904.ingest.de.sentry.io/4512030072373328",

  // Capped at 10% to conserve the free tier's monthly performance-event quota.
  tracesSampleRate: 0.1,

  // Noisy browser/extension errors that aren't actionable app bugs.
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
  ],
  denyUrls: [/^chrome-extension:\/\//i, /^moz-extension:\/\//i],

  beforeSend(event, hint) {
    const error = hint.originalException;
    if (error instanceof Response && error.status === 404) return null;
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      (error as { status?: number }).status === 404
    ) {
      return null;
    }
    return event;
  },

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
