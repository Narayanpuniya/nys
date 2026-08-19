"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2, ImagePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["General", "कार्यक्रम", "सामाजिक कार्य", "खेलकूद", "पुरस्कार", "टीम", "अन्य"];

interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string | null;
  category: string;
  date: Date;
}

export function GalleryUploadForm({ items }: { items: GalleryItem[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10)); // आज की तारीख default
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function onFiles(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files).map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setPreviews((p) => [...p, ...arr]);
  }

  function removePreview(i: number) {
    setPreviews((p) => { URL.revokeObjectURL(p[i].url); return p.filter((_, j) => j !== i); });
  }

  async function upload() {
    if (!previews.length) { setMsg({ type: "err", text: "कोई फ़ोटो नहीं चुनी।" }); return; }
    setLoading(true); setMsg(null);

    const fd = new FormData();
    previews.forEach(({ file }) => fd.append("files", file));
    fd.set("title", title);
    fd.set("category", category);
    fd.set("date", date);

    const res = await fetch("/api/admin/gallery", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setMsg({ type: "err", text: data.error ?? "अपलोड विफल।" }); return; }

    setMsg({ type: "ok", text: `${data.saved} फ़ोटो सफलतापूर्वक अपलोड हुई।${data.errors?.length ? ` (${data.errors.length} विफल)` : ""}` });
    setPreviews([]);
    setTitle("");
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  async function deleteItem(id: string) {
    if (!confirm("यह फ़ोटो हटाएँ?")) return;
    setDeleting(id);
    await fetch("/api/admin/gallery", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Upload panel */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-ink">
          <ImagePlus className="h-5 w-5 text-saffron-600" /> नई फ़ोटो अपलोड करें
        </h2>

        {/* Drop zone */}
        <label
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 py-10 text-sm text-stone-500 transition hover:border-saffron-400 hover:bg-saffron-50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
        >
          <Upload className="h-8 w-8 text-saffron-500" />
          <span className="text-center">
            फ़ोटो यहाँ खींचें या <span className="font-semibold text-saffron-700">क्लिक करें</span>
            <br />
            <span className="text-xs text-stone-400">JPG · PNG · WEBP · GIF — अधिकतम 5 MB प्रति फ़ोटो</span>
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
            {previews.map(({ url }, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePreview(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">शीर्षक (वैकल्पिक)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="जैसे: वार्षिक उत्सव 2025"
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-ink outline-none focus:border-saffron-400 focus:bg-white focus:ring-2 focus:ring-saffron-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">श्रेणी</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-ink outline-none focus:border-saffron-400 focus:bg-white"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">दिनांक</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-ink outline-none focus:border-saffron-400 focus:bg-white"
            />
          </div>
        </div>

        {msg && (
          <p className={cn("mt-3 rounded-lg px-3 py-2 text-sm", msg.type === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700")}>
            {msg.type === "ok" ? "✅" : "⚠️"} {msg.text}
          </p>
        )}

        <button
          onClick={upload}
          disabled={loading || !previews.length}
          className="mt-4 flex items-center gap-2 rounded-xl bg-saffron-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-saffron-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {loading ? "अपलोड हो रही है…" : `${previews.length ? `${previews.length} फ़ोटो` : ""} अपलोड करें`}
        </button>
      </div>

      {/* Gallery grid */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-ink">गैलरी ({items.length} फ़ोटो)</h2>
        {items.length === 0 ? (
          <p className="text-sm text-stone-400">अभी कोई फ़ोटो नहीं — ऊपर से अपलोड करें।</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {items.map((item) => (
              <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.title ?? ""} className="h-full w-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-1 opacity-0 transition group-hover:opacity-100">
                  {item.title && <p className="truncate text-xs text-white">{item.title}</p>}
                  <p className="text-xs text-stone-300">{new Date(item.date).toLocaleDateString("hi-IN")}</p>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  disabled={deleting === item.id}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-60"
                >
                  {deleting === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
