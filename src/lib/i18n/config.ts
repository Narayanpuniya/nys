export const LOCALES = ["hi", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "hi";
export const LOCALE_COOKIE = "nys_locale";

export function isLocale(v: unknown): v is Locale {
  return v === "hi" || v === "en";
}
