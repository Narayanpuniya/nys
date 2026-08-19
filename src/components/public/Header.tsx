"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { setLocale } from "@/app/actions/locale";
import { PUBLIC_NAV, PUBLIC_CTA } from "@/config/nav";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

// Compact lang switcher for mobile header (हि / En — 2 small pills)
function LanguageSwitcherCompact({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  function sw(next: Locale) {
    if (next === locale) return;
    start(async () => { await setLocale(next); router.refresh(); });
  }
  return (
    <div className={`inline-flex items-center rounded-full border border-saffron-200 bg-white/80 p-0.5 text-[11px] font-bold${pending ? " opacity-60" : ""}`}>
      <button type="button" onClick={() => sw("hi")}
        className={`rounded-full px-2 py-0.5 transition ${locale === "hi" ? "bg-saffron-600 text-white" : "text-stone-600"}`}>
        हि
      </button>
      <button type="button" onClick={() => sw("en")}
        className={`rounded-full px-2 py-0.5 transition ${locale === "en" ? "bg-saffron-600 text-white" : "text-stone-600"}`}>
        En
      </button>
    </div>
  );
}
import { cn } from "@/lib/utils";

export function Header({
  logoUrl,
  locale,
  dict,
  registrationNo,
  orgName,
  orgPlace,
}: {
  logoUrl?: string | null;
  locale: Locale;
  dict: Dictionary;
  registrationNo?: string;
  orgName?: string;
  orgPlace?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md" style={{ isolation: "isolate" }}>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2 lg:gap-6 lg:px-6 lg:py-3">

        {/* ── Logo + Org name ── */}
        <Link href="/" aria-label="NYS Home" className="flex min-w-0 flex-1 items-center gap-2 lg:shrink-0 lg:flex-none lg:gap-3">
          {/* Logo circle — smaller on mobile */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-saffron-200 bg-saffron-50 lg:h-14 lg:w-14">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={orgName ?? "NYS"} className="h-8 w-8 object-contain lg:h-12 lg:w-12" />
            ) : (
              <LogoMark className="h-7 w-7 lg:h-10 lg:w-10" />
            )}
          </div>
          {/* Org name — 1 line truncated on mobile, full on desktop */}
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold leading-tight text-maroon-800 lg:text-lg">
              {orgName ?? dict.orgName}
            </div>
            <div className="hidden text-[11px] text-stone-500 sm:block">{orgPlace ?? dict.orgPlace}</div>
            {registrationNo && (
              <div className="hidden text-[10px] font-semibold text-saffron-700 sm:block">
                Reg. No. {registrationNo}
              </div>
            )}
          </div>
        </Link>

        {/* ── Nav (center) — desktop only ── */}
        <nav className="hidden flex-1 items-center justify-center gap-0.5 xl:flex">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative px-3 py-2 text-sm font-medium text-stone-700 transition hover:text-maroon-800",
                pathname === item.href && "text-maroon-800 font-bold",
              )}
            >
              {dict[item.labelKey]}
              {pathname === item.href && (
                <span
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                  style={{ background: "linear-gradient(90deg, #d97706, #7f1d1d)" }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* ── Desktop right buttons ── */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <LanguageSwitcher locale={locale} />
          <Link
            href="/login"
            className="rounded-full border-2 border-maroon-700 px-4 py-1.5 text-sm font-bold text-maroon-800 transition hover:bg-maroon-50"
          >
            {dict.nav_login}
          </Link>
          <Link
            href="/join"
            className="rounded-full px-5 py-1.5 text-sm font-bold text-white shadow-md transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #991b1b, #7f1d1d)" }}
          >
            {dict.nav_join}
          </Link>
        </div>

        {/* ── Mobile: lang switcher (compact) + hamburger ── */}
        <div className="ml-auto flex shrink-0 items-center gap-1 xl:hidden">
          <LanguageSwitcherCompact locale={locale} />
          <button
            className="rounded-lg p-2 text-maroon-800 transition hover:bg-saffron-50 active:bg-saffron-100"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu panel ── */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-t border-stone-100 bg-white shadow-xl xl:hidden">
          {/* Nav links */}
          <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-1 px-4 pt-3 pb-2">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-saffron-50 active:bg-saffron-100",
                  pathname === item.href && "bg-saffron-50 font-bold text-maroon-800",
                )}
              >
                {dict[item.labelKey]}
              </Link>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="flex gap-2 px-4 pb-3">
            {PUBLIC_CTA.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl py-2.5 text-center text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}
              >
                {dict[c.labelKey]}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-maroon-300 px-4 py-2.5 text-sm font-medium text-maroon-800"
            >
              {dict.nav_login}
            </Link>
          </div>

          {/* Language switcher */}
          <div className="border-t border-stone-100 px-4 py-3">
            <LanguageSwitcher locale={locale} />
          </div>
        </div>
      )}
    </header>
  );
}
