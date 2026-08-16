"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { WhatsappIcon, FacebookIcon } from "@/components/ui/BrandIcons";

export function ShareButtons({ url, text }: { url: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const full = url.startsWith("http") ? url : `${base}${url}`;
  const enc = encodeURIComponent(full);
  const encText = encodeURIComponent(text);

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`https://wa.me/?text=${encText}%20${enc}`}
        target="_blank"
        className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
      >
        <WhatsappIcon className="h-4 w-4" /> WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${enc}`}
        target="_blank"
        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        <FacebookIcon className="h-4 w-4" /> Facebook
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encText}&url=${enc}`}
        target="_blank"
        className="inline-flex items-center gap-1.5 rounded-xl bg-black px-3 py-2 text-sm font-medium text-white hover:bg-stone-800"
      >
        X
      </a>
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(full);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Link2 className="h-4 w-4" />}
        {copied ? "कॉपी हुआ" : "लिंक कॉपी"}
      </button>
    </div>
  );
}
