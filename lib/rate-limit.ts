import "server-only";

// Best-effort, in-memory sliding-window limiter. This is NOT distributed —
// each warm serverless instance has its own Map, and a cold start resets it.
// That's a real limitation (it won't stop a determined, distributed attacker),
// but it costs no new infrastructure and still blocks the common case: a
// single script or browser tab hammering an endpoint in a tight loop. If this
// app outgrows that, swap this for a real store (e.g. Upstash Redis).
const hits = new Map<string, number[]>();

export function checkRateLimit(key: string, { max, windowMs }: { max: number; windowMs: number }): boolean {
  const now = Date.now();
  const existing = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (existing.length >= max) {
    hits.set(key, existing);
    return false;
  }
  existing.push(now);
  hits.set(key, existing);
  return true;
}
