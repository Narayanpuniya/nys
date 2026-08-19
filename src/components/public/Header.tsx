"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { PUBLIC_NAV, PUBLIC_CTA } from "@/config/nav";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
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
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 lg:px-6">

        {/* ── Logo + Org name + Reg No ── */}
        <Link href="/" aria-label="NYS Home" className="flex shrink-0 items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-saffron-200 bg-saffron-50">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={orgName ?? "NYS"} className="h-12 w-12 object-contain" />
            ) : (
              <LogoMark className="h-10 w-10" />
            )}
          </div>
          <div>
            <div className="text-base font-extrabold leading-tight text-maroon-800 lg:text-lg">
              {orgName ?? dict.orgName}
            </div>
            <div className="text-[11px] text-stone-500">{orgPlace ?? dict.orgPlace}</div>
            {registrationNo && (
              <div className="text-[10px] font-semibold text-saffron-700">
                Reg. No. {registrationNo}
              </div>
            )}
          </div>
        </Link>

        {/* ── Nav (center/right) ── */}
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
              {/* Underline indicator */}
              {pathname === item.href && (
                <span
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                  style={{ background: "linear-gradient(90deg, #d97706, #7f1d1d)" }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* ── Buttons ── */}
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

        {/* ── Mobile hamburger ── */}
        <div className="flex items-center gap-2 xl:hidden">
          <LanguageSwitcher locale={locale} />
          <button
            className="rounded-lg p-2 text-maroon-800"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {open && (
        <div className="border-t border-stone-100 bg-white xl:hidden">
          <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-1 px-4 py-3">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-saffron-50",
                  pathname === item.href && "bg-saffron-50 font-bold text-maroon-800",
                )}
              >
                {dict[item.labelKey]}
              </Link>
            ))}
          </nav>
          <div className="flex gap-2 px-4 pb-4">
            {PUBLIC_CTA.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl py-2 text-center text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}
              >
                {dict[c.labelKey]}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-maroon-300 px-4 py-2 text-sm font-medium text-maroon-800"
            >
              {dict.nav_login}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
