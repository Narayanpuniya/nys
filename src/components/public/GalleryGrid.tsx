"use client";

import { useState } from "react";
import { X } from "lucide-react";

type Item = { id: string; title?: string | null; imageUrl: string; category: string };

// Photo grid + lightbox + internal scroll।
export function GalleryGrid({ items }: { items: Item[] }) {
  const [active, setActive] = useState<Item | null>(null);
  const [cat, setCat] = useState("");
  const cats = Array.from(new Set(items.map((i) => i.category)));
  const filtered = cat ? items.filter((i) => i.category === cat) : items;

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
            </button>
          ))}
        </div>
        {filtered.length === 0 && <p className="py-10 text-center text-sm text-stone-400">फिलहाल कोई चित्र उपलब्ध नहीं है।</p>}
      </div>

      {active && (
        <div onClick={() => setActive(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <button className="absolute right-4 top-4 text-white" onClick={() => setActive(null)}><X className="h-8 w-8" /></button>
          <div className="max-h-[85vh] max-w-3xl">
            {active.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={active.imageUrl} alt={active.title ?? ""} className="max-h-[85vh] rounded-xl object-contain" />
            ) : <div className="rounded-xl bg-white p-20 text-6xl">🖼️</div>}
            {active.title && <p className="mt-2 text-center text-white">{active.title}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
