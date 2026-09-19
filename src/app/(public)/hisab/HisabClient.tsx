"use client";

import { useMemo, useState } from "react";
import { Search, X, ImageIcon, ChevronDown } from "lucide-react";

export type CashEntry = {
  id: string;
  date: string;
  side: "RECEIPT" | "PAYMENT";
  particulars: string;
  voucher: string | null;
  amount: number;
  balance: number;
  bookPage: number | null;
  category: string | null;
  note: string | null;
  photos: { id: string; url: string; caption: string | null }[];
};

const HI_MONTH = ["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून",
  "जुलाई", "अगस्त", "सितम्बर", "अक्टूबर", "नवम्बर", "दिसम्बर"];

function hDate(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${HI_MONTH[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

/** वित्तीय वर्ष: 1 अप्रैल से 31 मार्च */
function fy(iso: string) {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const start = d.getUTCMonth() >= 3 ? y : y - 1;
  return `${start}-${String(start + 1).slice(2)}`;
}

export function HisabClient({ entries }: { entries: CashEntry[] }) {
  const [q, setQ] = useState("");
  const [side, setSide] = useState<"ALL" | "RECEIPT" | "PAYMENT">("ALL");
  const [cat, setCat] = useState("सभी");
  const [year, setYear] = useState("सभी");
  const [open, setOpen] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ url: string; caption?: string } | null>(null);
  const [limit, setLimit] = useState(60);

  const cats = useMemo(
    () => ["सभी", ...Array.from(new Set(entries.map((e) => e.category).filter(Boolean) as string[])).sort()],
    [entries],
  );
  const years = useMemo(
    () => ["सभी", ...Array.from(new Set(entries.map((e) => fy(e.date)))).sort().reverse()],
    [entries],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return entries.filter((e) => {
      if (side !== "ALL" && e.side !== side) return false;
      if (cat !== "सभी" && e.category !== cat) return false;
      if (year !== "सभी" && fy(e.date) !== year) return false;
      if (!needle) return true;
      return (
        e.particulars.toLowerCase().includes(needle) ||
        (e.category ?? "").toLowerCase().includes(needle) ||
        (e.voucher ?? "").toLowerCase().includes(needle) ||
        hDate(e.date).includes(needle)
      );
    });
  }, [entries, q, side, cat, year]);

  const totals = useMemo(() => {
    let inc = 0, exp = 0, withPhoto = 0;
    for (const e of filtered) {
      if (e.side === "RECEIPT") inc += e.amount; else exp += e.amount;
      if (e.photos.length) withPhoto++;
    }
    return { inc, exp, withPhoto };
  }, [filtered]);

  const shown = filtered.slice(0, limit);

  return (
    <>
      {/* ── खोज व छँटनी ── */}
      <div className="sticky top-[56px] z-30 -mx-4 mb-5 border-y border-stone-200 bg-cream/95 px-4 py-3 backdrop-blur lg:top-[64px]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[210px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setLimit(60); }}
              placeholder="नाम, काम या तारीख़ से खोजें…"
              className="w-full rounded-full border border-stone-300 bg-white py-2 pl-9 pr-9 text-sm outline-none focus:border-saffron-500"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label="खोज हटाएँ"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-400 hover:bg-stone-100">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="inline-flex overflow-hidden rounded-full border border-stone-300 bg-white text-xs font-bold">
            {([["ALL", "सभी"], ["RECEIPT", "आय"], ["PAYMENT", "खर्च"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => { setSide(v); setLimit(60); }}
                className={`px-3 py-2 transition ${side === v
                  ? v === "RECEIPT" ? "bg-green-700 text-white"
                    : v === "PAYMENT" ? "bg-maroon-800 text-white"
                      : "bg-stone-800 text-white"
                  : "text-stone-600 hover:bg-stone-50"}`}>
                {l}
              </button>
            ))}
          </div>

          <select value={year} onChange={(e) => { setYear(e.target.value); setLimit(60); }}
            className="rounded-full border border-stone-300 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-saffron-500">
            {years.map((y) => <option key={y} value={y}>{y === "सभी" ? "सभी वर्ष" : `वर्ष ${y}`}</option>)}
          </select>

          <select value={cat} onChange={(e) => { setCat(e.target.value); setLimit(60); }}
            className="rounded-full border border-stone-300 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-saffron-500">
            {cats.map((c) => <option key={c} value={c}>{c === "सभी" ? "सभी श्रेणी" : c}</option>)}
          </select>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
          <span className="font-semibold text-stone-500">{filtered.length} प्रविष्टियाँ</span>
          <span className="font-bold text-green-700">आय {inr(totals.inc)}</span>
          <span className="font-bold text-maroon-800">खर्च {inr(totals.exp)}</span>
          {totals.withPhoto > 0 && (
            <span className="inline-flex items-center gap-1 text-stone-500">
              <ImageIcon className="h-3 w-3" /> {totals.withPhoto} के साथ फोटो
            </span>
          )}
        </div>
      </div>

      {/* ── सूची ── */}
      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 p-10 text-center text-sm text-stone-500">
          इस खोज से कोई प्रविष्टि नहीं मिली।
        </p>
      ) : (
        <ul className="space-y-2">
          {shown.map((e) => {
            const isOpen = open === e.id;
            const isIn = e.side === "RECEIPT";
            return (
              <li key={e.id}
                className={`overflow-hidden rounded-xl border bg-white transition ${isOpen ? "border-saffron-400 shadow-md" : "border-stone-200"}`}>
                <button
                  onClick={() => setOpen(isOpen ? null : e.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start gap-3 p-3 text-left hover:bg-stone-50 sm:p-4"
                >
                  <span className={`mt-0.5 hidden h-10 w-1.5 shrink-0 rounded-full sm:block ${isIn ? "bg-green-600" : "bg-maroon-700"}`} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-stone-500">
                      <span className="font-semibold text-stone-700">{hDate(e.date)}</span>
                      {e.category && (
                        <span className="rounded-full bg-saffron-50 px-2 py-0.5 font-medium text-saffron-800">{e.category}</span>
                      )}
                      {e.bookPage && <span>बही पृष्ठ {e.bookPage}</span>}
                      {e.voucher && <span>वाउचर {e.voucher}</span>}
                      {e.photos.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
                          <ImageIcon className="h-3 w-3" /> {e.photos.length}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-ink">{e.particulars}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className={`block text-base font-extrabold tabular-nums ${isIn ? "text-green-700" : "text-maroon-800"}`}>
                      {isIn ? "+" : "−"}{inr(e.amount)}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-stone-400">शेष {inr(e.balance)}</span>
                  </span>
                  <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-stone-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="border-t border-stone-100 bg-stone-50/60 p-3 sm:p-4">
                    {e.note && (
                      <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{e.note}</p>
                    )}
                    {e.photos.length === 0 && !e.note && (
                      <p className="text-xs text-stone-500">इस प्रविष्टि के लिए अभी कोई तस्वीर नहीं जोड़ी गई है।</p>
                    )}
                    {e.photos.length > 0 && (
                      <>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                          काम / चेक / बैठक की तस्वीरें
                        </p>
                        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {e.photos.map((p) => (
                            <button key={p.id} onClick={() => setLightbox({ url: p.url, caption: p.caption ?? undefined })}
                              className="group overflow-hidden rounded-lg border border-stone-200 bg-white">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.url} alt={p.caption ?? ""} loading="lazy"
                                className="h-28 w-full object-cover transition group-hover:scale-105" />
                              {p.caption && (
                                <span className="block px-1.5 py-1 text-left text-[10px] leading-tight text-stone-600">{p.caption}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {filtered.length > shown.length && (
        <div className="mt-6 text-center">
          <button onClick={() => setLimit((n) => n + 80)}
            className="rounded-full border-2 border-saffron-500 px-7 py-2.5 text-sm font-bold text-saffron-800 transition hover:bg-saffron-50">
            और दिखाएँ ({filtered.length - shown.length} बाकी)
          </button>
        </div>
      )}

      {/* ── फोटो बड़ी करके ── */}
      {lightbox && (
        <div role="dialog" aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}>
          <button aria-label="बंद करें"
            className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25">
            <X className="h-6 w-6" />
          </button>
          <figure className="max-h-full max-w-4xl overflow-auto" onClick={(ev) => ev.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox.url} alt={lightbox.caption ?? ""} className="mx-auto max-h-[85vh] w-auto rounded-lg" />
            {lightbox.caption && (
              <figcaption className="mt-3 text-center text-sm text-white/80">{lightbox.caption}</figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  );
}
