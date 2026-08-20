"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Download, CreditCard, Award, Receipt, ChevronDown } from "lucide-react";
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
  const [dlOpen, setDlOpen] = useState(false);
  const dlRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dlRef.current && !dlRef.current.contains(e.target as Node)) setDlOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md" style={{ isolation: "isolate" }}>
      <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-3 py-2 lg:gap-3 lg:px-4 lg:py-2">

        {/* ── Logo + Org name ── */}
        <Link href="/" aria-label="NYS Home" className="flex min-w-0 flex-1 items-center gap-2 lg:shrink-0 lg:flex-none">
          {/* Logo circle */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-saffron-200 bg-saffron-50 lg:h-12 lg:w-12">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={orgName ?? "NYS"} className="h-8 w-8 object-contain lg:h-10 lg:w-10" />
            ) : (
              <LogoMark className="h-7 w-7 lg:h-9 lg:w-9" />
            )}
          </div>
          {/* Org name */}
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold leading-tight text-maroon-800 lg:text-base">
              {orgName ?? dict.orgName}
            </div>
            <div className="hidden text-[10px] text-stone-500 lg:block">{orgPlace ?? dict.orgPlace}</div>
            {registrationNo && (
              <div className="hidden text-[9px] font-semibold text-saffron-700 lg:block">
                Reg. No. {registrationNo}
              </div>
            )}
          </div>
        </Link>

        {/* ── Nav (center) — desktop only ── */}
        <nav className="hidden flex-1 items-center justify-center gap-0 xl:flex">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative whitespace-nowrap px-2 py-2 text-[12px] font-medium text-stone-700 transition hover:text-maroon-800",
                pathname === item.href && "font-bold text-maroon-800",
              )}
            >
              {dict[item.labelKey]}
              {pathname === item.href && (
                <span
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                  style={{ background: "linear-gradient(90deg, #d97706, #7f1d1d)" }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* ── Desktop right buttons ── */}
        <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
          <LanguageSwitcher locale={locale} />

          {/* Downloads dropdown — icon + label compact */}
          <div className="relative" ref={dlRef}>
            <button
              type="button"
              onClick={() => setDlOpen((v) => !v)}
              className="flex items-center gap-1 rounded-full border border-stone-300 px-2.5 py-1 text-[11px] font-bold text-stone-700 transition hover:border-saffron-400 hover:text-saffron-800"
            >
              <Download className="h-3 w-3" />
              <span className="hidden 2xl:inline">{dict.nav_downloads}</span>
              <ChevronDown className={`h-2.5 w-2.5 transition-transform ${dlOpen ? "rotate-180" : ""}`} />
            </button>
            {dlOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-stone-100 bg-white py-2 shadow-xl">
                <p className="px-4 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">डाउनलोड</p>
                <Link href="/downloads#idcard" onClick={() => setDlOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-stone-700 hover:bg-blue-50 hover:text-blue-700">
                  <CreditCard className="h-4 w-4 text-blue-500" /> {dict.nav_dl_idcard}
                </Link>
                <Link href="/downloads#cert" onClick={() => setDlOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-stone-700 hover:bg-green-50 hover:text-green-700">
                  <Award className="h-4 w-4 text-green-500" /> {dict.nav_dl_cert}
                </Link>
                <Link href="/downloads#receipt" onClick={() => setDlOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-700">
                  <Receipt className="h-4 w-4 text-amber-500" /> {dict.nav_dl_receipt}
                </Link>
                <div className="mx-4 mt-1 border-t border-stone-100 pt-1">
                  <Link href="/downloads" onClick={() => setDlOpen(false)}
                    className="flex items-center gap-2 px-0 py-1.5 text-xs font-semibold text-saffron-700 hover:underline">
                    सभी डाउनलोड →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/login"
            className="whitespace-nowrap rounded-full border border-maroon-600 px-3 py-1 text-[11px] font-bold text-maroon-800 transition hover:bg-maroon-50"
          >
            {dict.nav_login}
          </Link>
          <Link
            href="/donate"
            className="whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold text-white shadow-md transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}
          >
            {dict.nav_donate}
          </Link>
          <Link
            href="/join"
            className="whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold text-white shadow-md transition hover:opacity-90"
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

          {/* Downloads section mobile */}
          <div className="mx-4 mb-2 rounded-xl border border-stone-100 bg-stone-50 p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">📥 दस्तावेज़ डाउनलोड</p>
            <div className="grid grid-cols-3 gap-1.5">
              <Link href="/downloads#idcard" onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-1 rounded-lg bg-white px-2 py-2 text-center text-[11px] font-semibold text-blue-700 shadow-sm">
                <CreditCard className="h-4 w-4" /> ID कार्ड
              </Link>
              <Link href="/downloads#cert" onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-1 rounded-lg bg-white px-2 py-2 text-center text-[11px] font-semibold text-green-700 shadow-sm">
                <Award className="h-4 w-4" /> प्रमाण पत्र
              </Link>
              <Link href="/downloads#receipt" onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-1 rounded-lg bg-white px-2 py-2 text-center text-[11px] font-semibold text-amber-700 shadow-sm">
                <Receipt className="h-4 w-4" /> दान रसीद
              </Link>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-2 px-4 pb-3">
            <Link
              href="/donate"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl py-2.5 text-center text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}
            >
              {dict.nav_donate}
            </Link>
            <Link
              href="/join"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl py-2.5 text-center text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #991b1b, #7f1d1d)" }}
            >
              {dict.nav_join}
            </Link>
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
