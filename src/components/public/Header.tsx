"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, X, Download, CreditCard, Award, Receipt, ChevronDown, ChevronRight, LogIn,
  Home, Info, Users, GraduationCap, Activity, CalendarDays, Megaphone, Building2, Image as ImageIcon, BarChart3, Phone,
  type LucideIcon,
} from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { GooglePlayIcon } from "@/components/ui/BrandIcons";
import { PLAY_STORE_URL } from "@/lib/constants";

// Side-drawer में हर nav item का icon (href के हिसाब से)
const NAV_ICONS: Record<string, LucideIcon> = {
  "/": Home, "/about": Info, "/team": Users, "/mentors": GraduationCap,
  "/activities": Activity, "/events": CalendarDays, "/campaigns": Megaphone,
  "/partners": Building2, "/gallery": ImageIcon, "/transparency": BarChart3, "/contact": Phone,
};
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

  // Drawer खुला हो तो page scroll lock; Escape से बंद
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

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

          {/* Google Play app — app के अंदर छिपा रहता है */}
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="web-only flex items-center gap-1.5 whitespace-nowrap rounded-full bg-stone-900 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-black"
          >
            <GooglePlayIcon className="h-3.5 w-3.5" />
            <span className="hidden 2xl:inline">Google Play</span>
            <span className="2xl:hidden">App</span>
          </a>
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
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Google Play"
            className="web-only flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-white active:bg-black"
          >
            <GooglePlayIcon className="h-4 w-4" />
          </a>
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

      {/* ── Mobile: app-style side drawer ── */}
      {open && (
        <div className="fixed inset-0 z-[70] xl:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="nys-fade-in absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          />

          {/* Drawer */}
          <aside className="nys-slide-in absolute left-0 top-0 flex h-full w-[82%] max-w-[340px] flex-col bg-white shadow-2xl">
            {/* Drawer header — logo + org */}
            <div
              className="relative px-5 pb-5 pt-[max(20px,env(safe-area-inset-top))] text-white"
              style={{ background: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 60%, #b45309 100%)" }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-3 top-3 rounded-full bg-white/15 p-1.5 transition hover:bg-white/25"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3 pr-8">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-md">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <LogoMark className="h-10 w-10" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[15px] font-extrabold leading-tight">{orgName ?? dict.orgName}</div>
                  <div className="mt-0.5 text-[11px] text-white/80">{orgPlace ?? dict.orgPlace}</div>
                  {registrationNo && (
                    <div className="mt-1 inline-block rounded bg-white/15 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide">
                      Reg. {registrationNo}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <nav className="px-2 py-2">
                {PUBLIC_NAV.map((item) => {
                  const Icon = NAV_ICONS[item.href] ?? ChevronRight;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-stone-700 transition active:bg-saffron-100",
                        active && "bg-saffron-50 font-bold text-maroon-800",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-500",
                          active && "bg-maroon-800 text-white",
                        )}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="flex-1">{dict[item.labelKey]}</span>
                      <ChevronRight className="h-4 w-4 text-stone-300" />
                    </Link>
                  );
                })}
              </nav>

              {/* Downloads */}
              <div className="mx-4 my-2 rounded-2xl border border-stone-100 bg-stone-50 p-3">
                <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">{dict.nav_downloads}</p>
                <div className="grid grid-cols-3 gap-2">
                  <Link href="/downloads#idcard" onClick={() => setOpen(false)}
                    className="flex flex-col items-center gap-1 rounded-xl bg-white px-2 py-2.5 text-center text-[11px] font-semibold text-blue-700 shadow-sm active:bg-blue-50">
                    <CreditCard className="h-5 w-5" /> {dict.nav_dl_idcard}
                  </Link>
                  <Link href="/downloads#cert" onClick={() => setOpen(false)}
                    className="flex flex-col items-center gap-1 rounded-xl bg-white px-2 py-2.5 text-center text-[11px] font-semibold text-green-700 shadow-sm active:bg-green-50">
                    <Award className="h-5 w-5" /> {dict.nav_dl_cert}
                  </Link>
                  <Link href="/downloads#receipt" onClick={() => setOpen(false)}
                    className="flex flex-col items-center gap-1 rounded-xl bg-white px-2 py-2.5 text-center text-[11px] font-semibold text-amber-700 shadow-sm active:bg-amber-50">
                    <Receipt className="h-5 w-5" /> {dict.nav_dl_receipt}
                  </Link>
                </div>
              </div>

              {/* Play Store app link — app के अंदर छिपा रहता है */}
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="web-only mx-4 my-2 flex items-center gap-3 rounded-2xl bg-stone-900 px-4 py-3 text-white shadow-sm active:bg-black"
              >
                <GooglePlayIcon className="h-7 w-7 shrink-0" />
                <span className="flex-1 leading-tight">
                  <span className="block text-[10px] uppercase tracking-wider text-white/60">{dict.app_get_it_on}</span>
                  <span className="block text-sm font-bold">Google Play</span>
                </span>
                <ChevronRight className="h-4 w-4 text-white/50" />
              </a>

              {/* Language */}
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-xs font-semibold text-stone-500">भाषा / Language</span>
                <LanguageSwitcher locale={locale} />
              </div>
            </div>

            {/* Sticky CTA footer */}
            <div className="border-t border-stone-100 bg-white px-3 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/donate"
                  onClick={() => setOpen(false)}
                  className="rounded-xl py-2.5 text-center text-sm font-bold text-white shadow-sm"
                  style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}
                >
                  {dict.nav_donate}
                </Link>
                <Link
                  href="/join"
                  onClick={() => setOpen(false)}
                  className="rounded-xl py-2.5 text-center text-sm font-bold text-white shadow-sm"
                  style={{ background: "linear-gradient(135deg, #991b1b, #7f1d1d)" }}
                >
                  {dict.nav_join}
                </Link>
              </div>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-maroon-200 py-2.5 text-sm font-semibold text-maroon-800 active:bg-maroon-50"
              >
                <LogIn className="h-4 w-4" /> {dict.nav_login}
              </Link>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
