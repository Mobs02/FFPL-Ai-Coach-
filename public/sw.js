// Minimal service worker — just enough to satisfy installability requirements
// (Chrome requires a registered service worker with a fetch handler before it
// will show the "Install app" prompt). This app's data changes constantly
// (live scores, points), so it deliberately does no caching — every request
// still goes straight to the network. Nothing here to break or go stale.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // No-op: let the browser handle every request normally.
});
