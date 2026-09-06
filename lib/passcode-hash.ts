/**
 * Passcode hashing (§14). Node-only (uses `crypto`), so this file must
 * never be imported from a client component.
 *
 * This is a screen-lock, not encryption — see the migration comment on
 * profiles.passcode_hash. scrypt is overkill for a 4-6 digit PIN's
 * keyspace, but it's built into Node with no extra dependency and costs
 * nothing extra at this scale.
 */
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function hashPasscode(pin: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPasscodeHash(pin: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(pin, salt, 32);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

export function isValidPasscodeFormat(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}
