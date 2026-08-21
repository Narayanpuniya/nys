"use client";

import { useState } from "react";
import { X, Calendar, Play } from "lucide-react";

type Item = {
  id: string;
  title?: string | null;
  imageUrl?: string | null;
  category: string;
  date?: string | null;
  // video items
  isVideo?: boolean;
  videoUrl?: string | null;
  thumbnail?: string | null;
};

export function GalleryGrid({ items }: { items: Item[] }) {
  const [active, setActive] = useState<Item | null>(null);
  const [cat, setCat] = useState("");

  const cats = Array.from(new Set(items.map((i) => i.category)));
  const filtered = cat ? items.filter((i) => i.category === cat) : items;

  function fmtDate(d?: string | null) {
    if (!d) return null;
    return new Date(d).toLocaleDateString("hi-IN", { day: "numeric", month: "long", year: "numeric" });
  }

  // Video item के लिए thumbnail (uploaded हो या default)
  function videoThumb(it: Item) {
    return it.thumbnail || null;
  }

  return (
    <div>
      {/* Category filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => setCat("")} className={`rounded-full px-3 py-1 text-sm ${!cat ? "bg-saffron-600 text-white" : "bg-white text-stone-600 border border-stone-200"}`}>सभी</button>
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full px-3 py-1 text-sm ${cat === c ? "bg-saffron-600 text-white" : "bg-white text-stone-600 border border-stone-200"}`}>{c}</button>
        ))}
      </div>

      <div className="nys-scroll max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((it) => (
            <button
              key={it.id}
              onClick={() => setActive(it)}
              className="group relative aspect-square overflow-hidden rounded-xl bg-stone-900"
            >
              {/* Thumbnail */}
              {it.isVideo ? (
                videoThumb(it) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={videoThumb(it)!} alt={it.title ?? ""} loading="lazy"
                    className="h-full w-full object-cover opacity-80 transition group-hover:scale-105 group-hover:opacity-70" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-950 via-stone-900 to-black">
                    <div className="text-center">
                      <div className="mx-auto mb-2 text-4xl">🎬</div>
                    </div>
                  </div>
                )
              ) : it.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.imageUrl} alt={it.title ?? ""} loading="lazy"
                  className="h-full w-full object-cover transition group-hover:scale-105" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-3xl">🖼️</span>
              )}

              {/* Play button overlay for videos */}
              {it.isVideo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md ring-2 ring-white/40 transition group-hover:scale-110 group-hover:bg-white/30">
                    <Play className="h-6 w-6 translate-x-0.5 fill-white text-white" />
                  </div>
                </div>
              )}

              {/* Hover overlay — title + date */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-2 opacity-0 transition group-hover:opacity-100">
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
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-stone-400">फिलहाल कोई चित्र/वीडियो उपलब्ध नहीं है।</p>
        )}
      </div>

      {/* Lightbox / Video Modal */}
      {active && (
        <div
          onClick={() => setActive(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          <button
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            onClick={() => setActive(null)}
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="max-h-[90vh] w-full max-w-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {active.isVideo && active.videoUrl ? (
              /* ── Video embed (Instagram / YouTube) ── */
              <div className="relative w-full overflow-hidden rounded-2xl bg-black" style={{ paddingBottom: "177.77%" /* 9:16 for reels */ }}>
                <iframe
                  src={active.videoUrl}
                  className="absolute inset-0 h-full w-full border-0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  scrolling="no"
                  title={active.title ?? "Video"}
                />
              </div>
            ) : (
              /* ── Photo lightbox ── */
              active.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={active.imageUrl} alt={active.title ?? ""} className="max-h-[80vh] rounded-xl object-contain" />
              ) : (
                <div className="rounded-xl bg-white p-20 text-6xl">🖼️</div>
              )
            )}

            {/* Caption */}
            <div className="mt-3 space-y-0.5">
              {active.title && <p className="font-semibold text-white">{active.title}</p>}
              {active.date && (
                <p className="flex items-center justify-center gap-1 text-sm text-stone-300">
                  <Calendar className="h-3.5 w-3.5" />{fmtDate(active.date)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
