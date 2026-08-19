/**
 * In-memory OTP store.
 * Key: "emergency_reset" (admin) या member का id
 * OTP 10 मिनट तक valid रहता है।
 */

interface OtpEntry {
  otp: string;
  expiresAt: number;
  attempts: number; // max 5 गलत tries
}

const store = new Map<string, OtpEntry>();

const OTP_TTL_MS   = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

/** नया 6-digit OTP बनाएं और key से store में save करें */
export function createOtp(key: string): string {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  store.set(key, { otp, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 });
  return otp;
}

/** OTP verify करें — returns "ok" | "expired" | "wrong" | "too_many" */
export function verifyOtp(key: string, inputOtp: string): "ok" | "expired" | "wrong" | "too_many" {
  const entry = store.get(key);
  if (!entry) return "expired";
  if (Date.now() > entry.expiresAt) { store.delete(key); return "expired"; }
  if (entry.attempts >= MAX_ATTEMPTS) { store.delete(key); return "too_many"; }
  if (entry.otp !== inputOtp.trim()) { entry.attempts += 1; return "wrong"; }
  store.delete(key); // सही OTP — use होने के बाद delete
  return "ok";
}

/** OTP कितने मिनट में expire होगा */
export function otpRemainingMinutes(key: string): number {
  const entry = store.get(key);
  if (!entry) return 0;
  return Math.ceil((entry.expiresAt - Date.now()) / 60000);
}

// ── Convenience keys ─────────────────────────────────────────────────────────
export const ADMIN_OTP_KEY = "emergency_reset";
