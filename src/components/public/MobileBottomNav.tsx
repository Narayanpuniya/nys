"use client";

import Link from "next/link";
import { Home, Newspaper, HandCoins, UserPlus, Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function MobileBottomNav({ dict }: { dict: Dictionary }) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: dict.nav_home, icon: Home },
    { href: "/activities", label: dict.nav_mobile_activity, icon: Newspaper },
    { href: "/donate", label: dict.nav_mobile_donate, icon: HandCoins, highlight: true },
    { href: "/join", label: dict.nav_mobile_join, icon: UserPlus },
    { href: "/contact", label: dict.nav_contact, icon: Phone },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-saffron-100 bg-cream/95 backdrop-blur lg:hidden">
      <div className="grid grid-cols-5">
        {items.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
                it.highlight
                  ? "text-white"
                  : active
                    ? "text-saffron-700"
                    : "text-stone-500",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  it.highlight && "nys-accent-bar shadow-md",
                )}
              >
                <Icon className={cn("h-5 w-5", it.highlight && "text-white")} />
              </span>
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
