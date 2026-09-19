"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Pencil, Trash2, X, Upload, ImageIcon, Save, Eye, EyeOff } from "lucide-react";

export type Photo = { id: string; url: string; caption: string | null };
export type Entry = {
  id: string;
  date: string;          // yyyy-mm-dd
  side: "RECEIPT" | "PAYMENT";
  particulars: string;
  voucher: string | null;
  cash: number;
  bank: number;
  amount: number;
  balance: number;
  bookPage: number | null;
  category: string | null;
  note: string | null;
  confidence: string;
  isPublished: boolean;
  photos: Photo[];
};

const CATS = ["शिक्षा", "खेल", "पर्यावरण", "निर्माण", "दान/सहयोग", "बैंक/प्रशासन", "अन्य"];
const inr = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
const HI = ["जनवरी","फरवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितम्बर","अक्टूबर","नवम्बर","दिसम्बर"];
const hDate = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return `${d} ${HI[m - 1]} ${y}`;
};

export function CashBookManager({ initial }: { initial: Entry[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [q, setQ] = useState("");
  const [side, setSide] = useState<"ALL" | "RECEIPT" | "PAYMENT">("ALL");
  const [edit, setEdit] = useState<Entry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [limit, setLimit] = useState(50);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return items.filter((e) => {
      if (side !== "ALL" && e.side !== side) return false;
      if (!n) return true;
      return (
        e.particulars.toLowerCase().includes(n) ||
        (e.category ?? "").toLowerCase().includes(n) ||
        (e.voucher ?? "").toLowerCase().includes(n) ||
        e.date.includes(n)
      );
    });
  }, [items, q, side]);

  function blank(): Entry {
    return {
      id: "", date: new Date().toISOString().slice(0, 10), side: "PAYMENT",
      particulars: "", voucher: null, cash: 0, bank: 0, amount: 0, balance: 0,
      bookPage: null, category: null, note: null, confidence: "high",
      isPublished: true, photos: [],
    };
  }

  async function save() {
    if (!edit) return;
    if (!edit.particulars.trim() || !edit.date) {
      setErr("दिनांक और विवरण भरना ज़रूरी है");
      return;
    }
    setBusy(true); setErr("");
    const fd = new FormData();
    if (!isNew) fd.set("id", edit.id);
    fd.set("date", edit.date);
    fd.set("side", edit.side);
    fd.set("particulars", edit.particulars.trim());
    fd.set("voucher", edit.voucher ?? "");
    fd.set("cash", String(edit.cash || 0));
    fd.set("bank", String(edit.bank || 0));
    fd.set("bookPage", edit.bookPage == null ? "" : String(edit.bookPage));
    fd.set("category", edit.category ?? "");
    fd.set("note", edit.note ?? "");
    fd.set("isPublished", String(edit.isPublished));
    const res = await fetch("/api/admin/cashbook", { method: isNew ? "POST" : "PUT", body: fd });
    setBusy(false);
    if (!res.ok) {
      setErr((await res.json().catch(() => ({}))).error ?? "सेव नहीं हो सका");
      return;
    }
    setEdit(null); setIsNew(false);
    router.refresh();
  }

  async function remove(e: Entry) {
    if (!confirm(`"${e.particulars.slice(0, 50)}" हटाएँ?\nइसकी सभी तस्वीरें भी हट जाएँगी।`)) return;
    const res = await fetch("/api/admin/cashbook", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: e.id }),
    });
    if (res.ok) { setItems((p) => p.filter((x) => x.id !== e.id)); router.refresh(); }
  }

  async function togglePublish(e: Entry) {
    const fd = new FormData();
    fd.set("id", e.id);
    fd.set("isPublished", String(!e.isPublished));
    const res = await fetch("/api/admin/cashbook", { method: "PUT", body: fd });
    if (res.ok) {
      setItems((p) => p.map((x) => (x.id === e.id ? { ...x, isPublished: !x.isPublished } : x)));
    }
  }

  async function upload(files: FileList | null) {
    if (!edit || !files?.length || isNew) return;
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.set("entryId", edit.id);
    Array.from(files).forEach((f) => fd.append("photos", f));
    const res = await fetch("/api/admin/cashbook/photos", { method: "POST", body: fd });
    setBusy(false);
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(j.error ?? "फोटो अपलोड नहीं हुई"); return; }
    const photos: Photo[] = j.photos;
    setEdit({ ...edit, photos });
    setItems((p) => p.map((x) => (x.id === edit.id ? { ...x, photos } : x)));
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  async function delPhoto(id: string) {
    if (!edit) return;
    const res = await fetch("/api/admin/cashbook/photos", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) return;
    const photos = edit.photos.filter((p) => p.id !== id);
    setEdit({ ...edit, photos });
    setItems((p) => p.map((x) => (x.id === edit.id ? { ...x, photos } : x)));
    router.refresh();
  }

  async function saveCaption(id: string, caption: string) {
    const fd = new FormData();
    fd.set("id", id); fd.set("caption", caption);
    await fetch("/api/admin/cashbook/photos", { method: "PUT", body: fd });
    router.refresh();
  }

  const inc = filtered.filter((e) => e.side === "RECEIPT").reduce((s, e) => s + e.amount, 0);
  const exp = filtered.filter((e) => e.side === "PAYMENT").reduce((s, e) => s + e.amount, 0);
  const shown = filtered.slice(0, limit);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">रोकड़ बही</h1>
          <p className="text-sm text-stone-500">
            {items.length} प्रविष्टियाँ · आय {inr(inc)} · खर्च {inr(exp)} ·{" "}
            <a href="/hisab" target="_blank" className="font-medium text-saffron-700 underline">
              खुला हिसाब पेज देखें
            </a>
          </p>
        </div>
        <button onClick={() => { setEdit(blank()); setIsNew(true); setErr(""); }}
          className="inline-flex items-center gap-2 rounded-full bg-saffron-600 px-4 py-2 text-sm font-bold text-white hover:bg-saffron-700">
          <Plus className="h-4 w-4" /> नई प्रविष्टि
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setLimit(50); }}
            placeholder="विवरण, श्रेणी, वाउचर या तारीख़ (2024-07) से खोजें…"
            className="w-full rounded-full border border-stone-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-saffron-500" />
        </div>
        <div className="inline-flex overflow-hidden rounded-full border border-stone-300 text-xs font-bold">
          {([["ALL","सभी"],["RECEIPT","आय"],["PAYMENT","खर्च"]] as const).map(([v,l]) => (
            <button key={v} onClick={() => { setSide(v); setLimit(50); }}
              className={`px-3 py-2 ${side===v ? "bg-stone-800 text-white" : "bg-white text-stone-600"}`}>{l}</button>
          ))}
        </div>
      </div>

      <ul className="space-y-1.5">
        {shown.map((e) => (
          <li key={e.id}
            className={`flex items-start gap-3 rounded-xl border bg-white p-3 ${e.isPublished ? "border-stone-200" : "border-dashed border-stone-300 opacity-60"}`}>
            <span className={`mt-1 h-8 w-1.5 shrink-0 rounded-full ${e.side==="RECEIPT" ? "bg-green-600" : "bg-maroon-700"}`} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-stone-500">
                <span className="font-semibold text-stone-700">{hDate(e.date)}</span>
                {e.category && <span className="rounded-full bg-saffron-50 px-2 py-0.5 text-saffron-800">{e.category}</span>}
                {e.bookPage && <span>पृष्ठ {e.bookPage}</span>}
                {e.voucher && <span>वा. {e.voucher}</span>}
                {e.photos.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                    <ImageIcon className="h-3 w-3" />{e.photos.length}
                  </span>
                )}
                {e.confidence !== "high" && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">जाँचें</span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-ink">{e.particulars}</p>
            </div>
            <div className="shrink-0 text-right">
              <div className={`text-sm font-extrabold tabular-nums ${e.side==="RECEIPT" ? "text-green-700" : "text-maroon-800"}`}>
                {e.side==="RECEIPT" ? "+" : "−"}{inr(e.amount)}
              </div>
              <div className="mt-1 flex justify-end gap-1">
                <button onClick={() => togglePublish(e)} title={e.isPublished ? "छिपाएँ" : "दिखाएँ"}
                  className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700">
                  {e.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => { setEdit(e); setIsNew(false); setErr(""); }} title="बदलें"
                  className="rounded p-1 text-blue-600 hover:bg-blue-50"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(e)} title="हटाएँ"
                  className="rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {filtered.length > shown.length && (
        <div className="mt-4 text-center">
          <button onClick={() => setLimit((n) => n + 80)}
            className="rounded-full border-2 border-saffron-500 px-6 py-2 text-sm font-bold text-saffron-800 hover:bg-saffron-50">
            और दिखाएँ ({filtered.length - shown.length} बाकी)
          </button>
        </div>
      )}

      {/* ── बदलने की खिड़की ── */}
      {edit && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
              <h2 className="font-bold text-ink">{isNew ? "नई प्रविष्टि" : "प्रविष्टि बदलें"}</h2>
              <button onClick={() => { setEdit(null); setIsNew(false); }} className="rounded-full p-1 hover:bg-stone-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 p-5">
              {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold text-stone-600">दिनांक *</span>
                  <input type="date" value={edit.date}
                    onChange={(ev) => setEdit({ ...edit, date: ev.target.value })}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-stone-600">प्रकार *</span>
                  <select value={edit.side}
                    onChange={(ev) => setEdit({ ...edit, side: ev.target.value as "RECEIPT" | "PAYMENT" })}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm">
                    <option value="RECEIPT">आय (प्राप्ति)</option>
                    <option value="PAYMENT">खर्च (भुगतान)</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-bold text-stone-600">विवरण — दानदाता का नाम / किस काम का पैसा *</span>
                <textarea rows={3} value={edit.particulars}
                  onChange={(ev) => setEdit({ ...edit, particulars: ev.target.value })}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
              </label>

              <div className="grid gap-3 sm:grid-cols-4">
                <label className="block">
                  <span className="text-xs font-bold text-stone-600">नकद ₹</span>
                  <input type="number" step="0.01" value={edit.cash || ""}
                    onChange={(ev) => setEdit({ ...edit, cash: parseFloat(ev.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-stone-600">बैंक ₹</span>
                  <input type="number" step="0.01" value={edit.bank || ""}
                    onChange={(ev) => setEdit({ ...edit, bank: parseFloat(ev.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-stone-600">वाउचर नं.</span>
                  <input value={edit.voucher ?? ""}
                    onChange={(ev) => setEdit({ ...edit, voucher: ev.target.value })}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-stone-600">बही पृष्ठ</span>
                  <input type="number" value={edit.bookPage ?? ""}
                    onChange={(ev) => setEdit({ ...edit, bookPage: ev.target.value ? parseInt(ev.target.value) : null })}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold text-stone-600">श्रेणी</span>
                  <select value={edit.category ?? ""}
                    onChange={(ev) => setEdit({ ...edit, category: ev.target.value || null })}
                    className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm">
                    <option value="">— चुनें —</option>
                    {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="flex items-end gap-2 pb-2">
                  <input type="checkbox" checked={edit.isPublished}
                    onChange={(ev) => setEdit({ ...edit, isPublished: ev.target.checked })}
                    className="h-4 w-4" />
                  <span className="text-sm text-stone-700">खुला हिसाब पेज पर दिखाएँ</span>
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-bold text-stone-600">टिप्पणी (public पेज पर भी दिखेगी)</span>
                <input value={edit.note ?? ""}
                  onChange={(ev) => setEdit({ ...edit, note: ev.target.value })}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
              </label>

              <p className="rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-500">
                कुल रकम: <strong className="text-ink">{inr((edit.cash || 0) + (edit.bank || 0))}</strong>
              </p>

              {/* फोटो */}
              <div className="rounded-xl border border-stone-200 p-3">
                <p className="mb-2 text-xs font-bold text-stone-600">
                  काम / चेक देते हुए / बैठक की तस्वीरें
                </p>
                {isNew ? (
                  <p className="text-xs text-stone-500">पहले प्रविष्टि सेव करें, फिर तस्वीरें जोड़ी जा सकेंगी।</p>
                ) : (
                  <>
                    {edit.photos.length > 0 && (
                      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {edit.photos.map((p) => (
                          <div key={p.id} className="overflow-hidden rounded-lg border border-stone-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.url} alt="" className="h-24 w-full object-cover" />
                            <input defaultValue={p.caption ?? ""} placeholder="कैप्शन…"
                              onBlur={(ev) => saveCaption(p.id, ev.target.value)}
                              className="w-full border-t border-stone-100 px-1.5 py-1 text-[11px] outline-none" />
                            <button onClick={() => delPhoto(p.id)}
                              className="w-full bg-red-50 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100">
                              हटाएँ
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" multiple
                      onChange={(ev) => upload(ev.target.files)} className="hidden" />
                    <button onClick={() => fileRef.current?.click()} disabled={busy}
                      className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold text-stone-700 hover:border-saffron-400 disabled:opacity-50">
                      <Upload className="h-4 w-4" /> {busy ? "अपलोड हो रहा है…" : "तस्वीरें चुनें (एक साथ कई)"}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-stone-200 px-5 py-3">
              <button onClick={() => { setEdit(null); setIsNew(false); }}
                className="rounded-lg px-4 py-2 text-sm text-stone-600 hover:bg-stone-100">रद्द</button>
              <button onClick={save} disabled={busy}
                className="inline-flex items-center gap-2 rounded-lg bg-saffron-600 px-5 py-2 text-sm font-bold text-white hover:bg-saffron-700 disabled:opacity-50">
                <Save className="h-4 w-4" /> {busy ? "…" : "सेव करें"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
