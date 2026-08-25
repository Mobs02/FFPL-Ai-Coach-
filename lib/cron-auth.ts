import "server-only";
import { timingSafeEqual } from "crypto";

// Plain `!==` on a secret leaks timing information character-by-character.
// timingSafeEqual needs equal-length buffers, so length is checked first
// (a length mismatch is safe to leak — it reveals nothing about the secret).
export function isValidCronSecret(authHeader: string | null): boolean {
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  const provided = authHeader ?? "";
  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(provided);
  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}
