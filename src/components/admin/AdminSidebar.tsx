"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import * as Icons from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

type NavItem = { href: string; label: string; icon: string };

export function AdminSidebar({
  items,
  user,
  locale,
  logoutLabel,
}: {
  items: NavItem[];
  user: { name: string; role: string };
  locale: Locale;
  logoutLabel: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function Icon({ name, className }: { name: string; className?: string }) {
    const Cmp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Icons.Circle;
    return <Cmp className={className} />;
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-stone-200 bg-white p-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <LogoMark className="h-8 w-8" /> <span className="font-bold text-ink">NYS Admin</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <button onClick={() => setOpen((v) => !v)} className="rounded-lg p-2">
            {open ? <Icons.X className="h-6 w-6" /> : <Icons.Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 -translate-x-full overflow-y-auto border-r border-stone-200 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open && "translate-x-0",
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 p-4">
          <div className="flex items-center gap-2">
            <LogoMark className="h-9 w-9" />
            <div className="leading-tight">
              <div className="text-sm font-extrabold text-ink">NYS Admin</div>
            </div>
          </div>
          <div className="hidden lg:block">
            <LanguageSwitcher locale={locale} />
          </div>
        </div>

        <nav className="space-y-0.5 p-2">
          {items.map((it) => {
            const active = pathname === it.href || (it.href !== "/admin" && pathname.startsWith(it.href));
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active ? "bg-saffron-50 text-saffron-800" : "text-stone-600 hover:bg-stone-50",
                )}
              >
                <Icon name={it.icon} className="h-4.5 w-4.5" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-stone-100 p-3">
          <div className="mb-2 rounded-lg bg-stone-50 p-2 text-xs">
            <div className="font-semibold text-ink">{user.name}</div>
            <div className="text-stone-500">{user.role}</div>
          </div>
          <a href="/admin/logout" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            <Icons.LogOut className="h-4 w-4" /> {logoutLabel}
          </a>
        </div>
      </aside>
    </>
  );
}
