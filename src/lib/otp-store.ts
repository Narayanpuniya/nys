/**
 * In-memory OTP store for emergency reset.
 * OTP 10 मिनट तक valid रहता है।
 */

interface OtpEntry {
  otp: string;
  expiresAt: number; // Date.now() + 10 min
  attempts: number;  // max 5 गलत tries
}

// Module-level store (Hostinger single Node.js instance पर काम करता है)
const store = new Map<string, OtpEntry>();

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;
const STORE_KEY = "emergency_reset"; // single key — only one active OTP

/** नया 6-digit OTP बनाएं और store में save करें */
export function createOtp(): string {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  store.set(STORE_KEY, {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
  return otp;
}

/** OTP verify करें — returns "ok" | "expired" | "wrong" | "too_many" */
export function verifyOtp(inputOtp: string): "ok" | "expired" | "wrong" | "too_many" {
  const entry = store.get(STORE_KEY);

  if (!entry) return "expired";
  if (Date.now() > entry.expiresAt) {
    store.delete(STORE_KEY);
    return "expired";
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(STORE_KEY);
    return "too_many";
  }

  if (entry.otp !== inputOtp.trim()) {
    entry.attempts += 1;
    return "wrong";
  }

  // सही OTP — use होने के बाद delete करें
  store.delete(STORE_KEY);
  return "ok";
}

/** OTP कितने मिनट में expire होगा */
export function otpRemainingMinutes(): number {
  const entry = store.get(STORE_KEY);
  if (!entry) return 0;
  return Math.ceil((entry.expiresAt - Date.now()) / 60000);
}
