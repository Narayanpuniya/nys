"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Homepage पर hero full-bleed (no top padding) — बाकी pages पर fixed header की height का padding
export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/en" || pathname === "/hi";
  return (
    <main className={cn("flex-1 pb-20 lg:pb-0", !isHome && "pt-[62px]")}>
      {children}
    </main>
  );
}
