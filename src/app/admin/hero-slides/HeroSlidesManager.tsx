"use client";

import { useRef, useState } from "react";
import { Trash2, Upload, GripVertical, ImagePlus, CheckCircle2, RotateCcw } from "lucide-react";
import type { HeroSlide } from "@/lib/settings";

export function HeroSlidesManager({ initialSlides }: { initialSlides: HeroSlide[] }) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [uploading, setUploading] = useState(false);
  const [loadingDefaults, setLoadingDefaults] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) { setMessage({ type: "err", text: "पहले फोटो चुनें।" }); return; }
    setUploading(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      if (title) fd.append("title", title);
      const res = await fetch("/api/admin/hero-slides", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).error ?? "Upload failed");
      const newSlide = (await res.json()) as HeroSlide;
      setSlides((prev) => [...prev, newSlide]);
      setPreview(null);
      setTitle("");
      if (fileRef.current) fileRef.current.value = "";
      setMessage({ type: "ok", text: "स्लाइड जोड़ी गई ✓" });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Error" });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("इस स्लाइड को हटाएं?")) return;
    const res = await fetch(`/api/admin/hero-slides?id=${id}`, { method: "DELETE" });
    if (res.ok) setSlides((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleLoadDefaults() {
    if (!confirm("NYS की 5 default slides load करें? मौजूदा slides हट जाएंगी।")) return;
    setLoadingDefaults(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/hero-slides", { method: "PUT" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      const data = await res.json() as { slides: HeroSlide[] };
      setSlides(data.slides);
      setMessage({ type: "ok", text: "5 NYS default slides load हो गई ✓" });
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Error" });
    } finally {
      setLoadingDefaults(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Upload new slide ── */}
      <div className="rounded-2xl border border-saffron-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-bold text-ink">
          <ImagePlus className="h-5 w-5 text-saffron-600" />
          नई स्लाइड जोड़ें
        </h2>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Image picker */}
          <div>
            <label
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-saffron-300 bg-saffron-50 p-6 transition hover:border-saffron-500 hover:bg-saffron-100"
              onClick={() => fileRef.current?.click()}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="preview" className="max-h-40 rounded-lg object-cover shadow" />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-saffron-400" />
                  <span className="text-sm font-medium text-saffron-700">फोटो चुनें (JPG/PNG/WEBP)</span>
                  <span className="text-xs text-stone-400">अधिकतम 5 MB</span>
                </>
              )}
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onFileChange}
            />
          </div>

          {/* Title + submit */}
          <div className="flex flex-col justify-between gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-600">
                कैप्शन (वैकल्पिक)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="जैसे: वृक्षारोपण अभियान 2026"
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-saffron-400 focus:ring-2 focus:ring-saffron-100"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || !preview}
              className="flex items-center justify-center gap-2 rounded-xl bg-saffron-600 px-6 py-3 font-semibold text-white transition hover:bg-saffron-700 disabled:opacity-50"
            >
              {uploading ? (
                <><span className="animate-spin">⏳</span> अपलोड हो रहा है…</>
              ) : (
                <><Upload className="h-4 w-4" /> स्लाइड जोड़ें</>
              )}
            </button>

            {message && (
              <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                message.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {message.type === "ok" && <CheckCircle2 className="h-4 w-4" />}
                {message.text}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Current slides ── */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-ink">
          वर्तमान स्लाइड्स ({slides.length})
        </h2>

        {slides.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            <ImagePlus className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p className="mb-4">कोई स्लाइड नहीं। ऊपर से जोड़ें या NYS default slides load करें।</p>
            <button
              onClick={handleLoadDefaults}
              disabled={loadingDefaults}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-saffron-300 bg-saffron-50 px-5 py-2.5 text-sm font-semibold text-saffron-800 transition hover:bg-saffron-100 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              {loadingDefaults ? "लोड हो रहा है…" : "NYS Default Slides लोड करें"}
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                className="group relative overflow-hidden rounded-xl border border-stone-200 bg-stone-50 shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.imageUrl}
                  alt={slide.title ?? `Slide ${idx + 1}`}
                  className="h-40 w-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/30" />

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white opacity-0 shadow transition group-hover:opacity-100 hover:bg-red-700"
                  title="हटाएं"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Drag handle (visual only) */}
                <div className="absolute left-2 top-2 rounded-full bg-black/40 p-1 text-white opacity-0 transition group-hover:opacity-100">
                  <GripVertical className="h-4 w-4" />
                </div>

                {/* Caption */}
                <div className="border-t border-stone-100 bg-white p-2.5">
                  <div className="text-xs font-medium text-stone-600 truncate">
                    {slide.title ?? <span className="text-stone-300">कोई कैप्शन नहीं</span>}
                  </div>
                  <div className="text-[10px] text-stone-400">क्रम: {idx + 1}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        💡 <strong>सुझाव:</strong> Wide landscape photos (16:9) सबसे अच्छी दिखती हैं। न्यूनतम 1280×720px रखें।
      </div>
    </div>
  );
}
