"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function Icon({ name, className }: { name: string; className?: string }) {
    const Cmp =
      (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ??
      Icons.Circle;
    return <Cmp className={className} />;
  }

  return (
    <div className="w-full shrink-0 lg:w-64">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-stone-200 bg-white px-3 py-2.5 lg:hidden">
        <Link href="/admin" className="flex min-w-0 items-center gap-2">
          <LogoMark className="h-8 w-8 shrink-0" />
          <span className="truncate font-bold text-ink">NYS Admin</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5">
          <LanguageSwitcher locale={locale} />
          <button
            type="button"
            aria-label={open ? "मेनू बंद करें" : "मेनू खोलें"}
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 hover:bg-stone-100"
          >
            {open ? <Icons.X className="h-6 w-6" /> : <Icons.Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <button
          type="button"
          aria-label="मेनू बंद करें"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col overflow-y-auto border-r border-stone-200 bg-white transition-transform duration-200 lg:static lg:z-auto lg:h-screen lg:w-64 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="hidden items-center justify-between gap-2 border-b border-stone-100 p-4 lg:flex">
          <div className="flex items-center gap-2">
            <LogoMark className="h-9 w-9" />
            <div className="text-sm font-extrabold text-ink">NYS Admin</div>
          </div>
          <LanguageSwitcher locale={locale} />
        </div>

        <nav className="flex-1 space-y-0.5 p-2 pt-3 lg:pt-2">
          {items.map((it) => {
            const active =
              pathname === it.href || (it.href !== "/admin" && pathname.startsWith(it.href));
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  active ? "bg-saffron-50 text-saffron-800" : "text-stone-600 hover:bg-stone-50",
                )}
              >
                <Icon name={it.icon} className="h-4 w-4 shrink-0" />
                <span className="truncate">{it.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-stone-100 p-3">
          <div className="mb-2 rounded-lg bg-stone-50 p-2 text-xs">
            <div className="truncate font-semibold text-ink">{user.name}</div>
            <div className="truncate text-stone-500">{user.role}</div>
          </div>
          <a
            href="/admin/logout"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Icons.LogOut className="h-4 w-4" /> {logoutLabel}
          </a>
        </div>
      </aside>
    </div>
  );
}
