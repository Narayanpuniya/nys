"use client";

import { useState } from "react";
import { X, Calendar } from "lucide-react";

type Item = { id: string; title?: string | null; imageUrl: string; category: string; date?: string | null };

// Photo grid + lightbox + internal scroll।
export function GalleryGrid({ items }: { items: Item[] }) {
  const [active, setActive] = useState<Item | null>(null);
  const [cat, setCat] = useState("");
  const cats = Array.from(new Set(items.map((i) => i.category)));
  const filtered = cat ? items.filter((i) => i.category === cat) : items;

  function fmtDate(d?: string | null) {
    if (!d) return null;
    return new Date(d).toLocaleDateString("hi-IN", { day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => setCat("")} className={`rounded-full px-3 py-1 text-sm ${!cat ? "bg-saffron-600 text-white" : "bg-white text-stone-600 border border-stone-200"}`}>सभी</button>
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full px-3 py-1 text-sm ${cat === c ? "bg-saffron-600 text-white" : "bg-white text-stone-600 border border-stone-200"}`}>{c}</button>
        ))}
      </div>

      <div className="nys-scroll max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((it) => (
            <button key={it.id} onClick={() => setActive(it)} className="group relative aspect-square overflow-hidden rounded-xl bg-saffron-100">
              {it.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.imageUrl} alt={it.title ?? ""} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-3xl">🖼️</span>
              )}
              {/* hover overlay — title + date */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2 opacity-0 transition group-hover:opacity-100">
                {it.title && <p className="truncate text-xs font-medium text-white">{it.title}</p>}
                {it.date && (
                  <p className="flex items-center gap-1 text-xs text-stone-300">
                    <Calendar className="h-3 w-3" />{fmtDate(it.date)}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
        {filtered.length === 0 && <p className="py-10 text-center text-sm text-stone-400">फिलहाल कोई चित्र उपलब्ध नहीं है।</p>}
      </div>

      {/* Lightbox */}
      {active && (
        <div onClick={() => setActive(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <button className="absolute right-4 top-4 text-white" onClick={() => setActive(null)}><X className="h-8 w-8" /></button>
          <div className="max-h-[85vh] max-w-3xl text-center">
            {active.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={active.imageUrl} alt={active.title ?? ""} className="max-h-[80vh] rounded-xl object-contain" />
            ) : <div className="rounded-xl bg-white p-20 text-6xl">🖼️</div>}
            <div className="mt-2 space-y-0.5">
              {active.title && <p className="font-semibold text-white">{active.title}</p>}
              {active.date && (
                <p className="flex items-center justify-center gap-1 text-sm text-stone-300">
                  <Calendar className="h-3.5 w-3.5" />{fmtDate(active.date)}
                </p>
              )}
              <p className="text-xs text-stone-400">{active.category}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
