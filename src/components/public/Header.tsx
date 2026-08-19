"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShieldCheck } from "lucide-react";
import { LogoFull } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { PUBLIC_NAV, PUBLIC_CTA } from "@/config/nav";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function Header({
  logoUrl,
  locale,
  dict,
}: {
  logoUrl?: string | null;
  locale: Locale;
  dict: Dictionary;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-saffron-100 bg-cream/90 backdrop-blur">
      <div className="h-1 w-full nys-accent-bar" />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" aria-label="NYS Home">
          <LogoFull
            imageUrl={logoUrl}
            name={dict.orgName}
            place={dict.orgPlace}
          />
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-saffron-50 hover:text-saffron-800",
                pathname === item.href && "bg-saffron-50 text-saffron-800",
              )}
            >
              {dict[item.labelKey]}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher locale={locale} />
          <ButtonLink href="/join" size="sm" variant="outline">
            {dict.nav_join}
          </ButtonLink>
          <ButtonLink href="/donate" size="sm" variant="primary">
            {dict.nav_donate}
          </ButtonLink>
          <Link
            href="/login"
            className="ml-1 inline-flex items-center gap-1 rounded-lg border border-saffron-200 bg-saffron-50 px-2.5 py-2 text-xs font-medium text-saffron-700 hover:bg-saffron-100"
          >
            <ShieldCheck className="h-4 w-4" /> {dict.nav_login}
          </Link>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <LanguageSwitcher locale={locale} />
          <button
            className="rounded-lg p-2 text-ink"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-saffron-100 bg-cream xl:hidden">
          <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-1 px-4 py-3">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-saffron-50"
              >
                {dict[item.labelKey]}
              </Link>
            ))}
          </nav>
          <div className="flex gap-2 px-4 pb-4">
            {PUBLIC_CTA.map((c) => (
              <ButtonLink key={c.href} href={c.href} size="sm" className="flex-1" onClick={() => setOpen(false)}>
                {dict[c.labelKey]}
              </ButtonLink>
            ))}
            <ButtonLink href="/login" size="sm" variant="ghost" onClick={() => setOpen(false)}>
              {dict.nav_login}
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
