import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an integer rupee amount as Indian currency, e.g. 135000 -> "₹1,35,000". */
export function formatINR(amount: number, withSymbol = true): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount || 0));
  return withSymbol ? `₹${formatted}` : formatted;
}

/** Indian-grouped number without a currency symbol, e.g. 150000 -> "1,50,000". */
export function formatNumber(n: number | null | undefined): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.round(Number(n) || 0),
  );
}

/** Compact Indian number, e.g. 1200 -> "1.2K", 150000 -> "1.5L". */
export function formatCompactINR(amount: number): string {
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return String(amount);
}

/** Format a date in Hindi (hi-IN) style, e.g. "15 अगस्त 2026". */
export function formatDateHi(
  date: Date | string | number | null | undefined,
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
): string {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("hi-IN", opts).format(d);
}

/** Percentage of part/total, clamped to 0..100 (one decimal). */
export function clampPercent(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((part / total) * 1000) / 10));
}

/** Parse a JSON string safely; return `fallback` on any error or empty input. */
export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (value == null || value === "") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** URL-safe ASCII slug (Devanagari मात्राएँ hyphen बना देती थीं → 404)। */
export function slugify(text: string): string {
  const ascii = text
    .toString()
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return ascii || `item-${Date.now().toString(36)}`;
}
