"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Video, Trash2, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["General", "कार्यक्रम", "सामाजिक कार्य", "खेलकूद", "पुरस्कार", "टीम", "अन्य"];

interface VideoItem {
  id: string;
  title: string;
  category: string;
  videoUrl: string | null;
  thumbnail: string | null;
  date: Date;
}

export function VideoUploadForm({ items }: { items: VideoItem[] }) {
  const router = useRouter();
  const thumbRef = useRef<HTMLInputElement>(null);

  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function onThumb(f: File | null) {
    if (!f) return;
    setThumbFile(f);
    setThumbPreview(URL.createObjectURL(f));
  }

  async function addVideo() {
    if (!videoUrl.trim()) { setMsg({ type: "err", text: "Instagram/YouTube link डालें।" }); return; }
    if (!title.trim())    { setMsg({ type: "err", text: "शीर्षक आवश्यक है।" }); return; }

    setLoading(true); setMsg(null);
    const fd = new FormData();
    fd.set("videoUrl", videoUrl.trim());
    fd.set("title", title.trim());
    fd.set("category", category);
    fd.set("date", date);
    if (thumbFile) fd.set("thumbnail", thumbFile);

    const res = await fetch("/api/admin/gallery/video", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setMsg({ type: "err", text: data.error ?? "कुछ गड़बड़ हुई।" }); return; }

    setMsg({ type: "ok", text: "✅ Video जोड़ा गया।" });
    setVideoUrl(""); setTitle(""); setThumbFile(null); setThumbPreview(null);
    if (thumbRef.current) thumbRef.current.value = "";
    router.refresh();
  }

  async function deleteVideo(id: string) {
    if (!confirm("यह video हटाएँ?")) return;
    setDeleting(id);
    await fetch("/api/admin/gallery/video", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Add video panel */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-ink">
          <Video className="h-5 w-5 text-purple-600" /> नया Video जोड़ें (Instagram / YouTube)
        </h2>

        <div className="space-y-3">
          {/* Instagram/YouTube URL */}
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Instagram / YouTube Link <span className="text-red-500">*</span>
            </label>
            <input
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://www.instagram.com/reel/ABC123/ या YouTube URL"
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-ink outline-none focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
            />
            <p className="mt-1 text-xs text-stone-400">
              Instagram post/reel/TV किसी का भी link चलेगा। Video public होनी चाहिए।
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {/* Title */}
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">शीर्षक <span className="text-red-500">*</span></label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="जैसे: वार्षिक उत्सव हाइलाइट"
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-ink outline-none focus:border-purple-400 focus:bg-white"
              />
            </div>
            {/* Category */}
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">श्रेणी</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-ink outline-none focus:border-purple-400 focus:bg-white">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {/* Date */}
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">दिनांक</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-ink outline-none focus:border-purple-400 focus:bg-white" />
            </div>
          </div>

          {/* Thumbnail (optional) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Thumbnail (वैकल्पिक) — Video का screenshot/cover
            </label>
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-600 hover:border-purple-400 hover:bg-purple-50">
                <Plus className="h-4 w-4" /> Thumbnail चुनें
                <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={e => onThumb(e.target.files?.[0] ?? null)} />
              </label>
              {thumbPreview && (
                <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbPreview} alt="" className="h-full w-full object-cover" />
                </div>
              )}
              {!thumbPreview && <p className="text-xs text-stone-400">नहीं चुनी → default video card दिखेगा</p>}
            </div>
          </div>
        </div>

        {msg && (
          <p className={cn("mt-3 rounded-lg px-3 py-2 text-sm", msg.type === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700")}>
            {msg.text}
          </p>
        )}

        <button onClick={addVideo} disabled={loading}
          className="mt-4 flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
          {loading ? "जोड़ा जा रहा है…" : "Video जोड़ें"}
        </button>
      </div>

      {/* Videos list */}
      {items.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-ink">Videos ({items.length})</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map(v => (
              <div key={v.id} className="group relative aspect-video overflow-hidden rounded-xl bg-stone-900">
                {v.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.thumbnail} alt={v.title} className="h-full w-full object-cover opacity-80" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900 to-stone-900">
                    <Video className="h-10 w-10 text-purple-300 opacity-60" />
                  </div>
                )}
                {/* Play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1.5">
                  <p className="truncate text-xs font-medium text-white">{v.title}</p>
                  <p className="text-[10px] text-stone-300">{v.category}</p>
                </div>
                {/* Delete button */}
                <button onClick={() => deleteVideo(v.id)} disabled={deleting === v.id}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-60">
                  {deleting === v.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
