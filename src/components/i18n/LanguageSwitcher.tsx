"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/actions/locale";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale) return;
    start(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-saffron-200 bg-white/80 p-0.5 text-xs font-semibold",
        pending && "opacity-60",
      )}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => switchTo("hi")}
        className={cn(
          "rounded-full px-2.5 py-1 transition",
          locale === "hi" ? "bg-saffron-600 text-white" : "text-stone-600 hover:bg-saffron-50",
        )}
      >
        हिन्दी
      </button>
      <button
        type="button"
        onClick={() => switchTo("en")}
        className={cn(
          "rounded-full px-2.5 py-1 transition",
          locale === "en" ? "bg-saffron-600 text-white" : "text-stone-600 hover:bg-saffron-50",
        )}
      >
        English
      </button>
    </div>
  );
}
