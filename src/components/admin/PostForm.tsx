"use client";

import { useRef, useState } from "react";
import { savePost } from "@/app/admin/posts/actions";
import { Field, inputClass } from "@/components/ui/primitives";
import { POST_STATUS } from "@/lib/constants";
import { Loader2, Upload, X, Plus, ImageIcon } from "lucide-react";
import { safeJsonParse } from "@/lib/utils";

type Post = {
  id: string;
  title: string;
  headline: string | null;
  reporter: string | null;
  priority: string;
  categoryId: string | null;
  location: string | null;
  excerpt: string | null;
  content: string;
  mainImage: string | null;
  images: string | null;
  youtubeUrl: string | null;
  facebookUrl: string | null;
  impactNumber: number | null;
  impactLabel: string | null;
  status: string;
  featured: boolean;
  date: Date;
};

// ── Single image upload helper ────────────────────────────────────────────────
async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/posts/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "अपलोड विफल");
  return data.url as string;
}

// ── Main Image Uploader ───────────────────────────────────────────────────────
function MainImagePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "अपलोड विफल");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {/* Preview */}
      {value && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="main" className="h-40 w-full max-w-sm rounded-xl border object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Upload button */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-saffron-300 bg-saffron-50 px-3 py-2 text-sm font-semibold text-saffron-800 hover:bg-saffron-100 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {value ? "बदलें" : "फोटो अपलोड करें"}
        </button>
        <span className="text-xs text-stone-400">या नीचे URL डालें</span>
      </div>

      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {/* Manual URL fallback */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://... (URL से भी जोड़ सकते हैं)"
        className={inputClass}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ── Gallery Multi-Image Uploader ──────────────────────────────────────────────
function GalleryPicker({
  urls,
  onChange,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    setError("");
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadImage(file);
        uploaded.push(url);
      }
      onChange([...urls, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "अपलोड विफल");
    } finally {
      setUploading(false);
    }
  }

  function remove(i: number) {
    onChange(urls.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      {/* Preview grid */}
      {urls.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {urls.map((src, i) => (
            <div key={i} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`gallery ${i + 1}`}
                className="aspect-square w-full rounded-xl border object-cover"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-0.5 text-white opacity-0 shadow-sm transition group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
              <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1 text-[10px] text-white">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add button */}
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 py-3 text-sm font-semibold text-stone-600 hover:border-saffron-400 hover:bg-saffron-50 disabled:opacity-50"
      >
        {uploading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> अपलोड हो रहा है...</>
        ) : (
          <><Plus className="h-4 w-4" /> <ImageIcon className="h-4 w-4" /> फोटो जोड़ें (एक या अधिक)</>
        )}
      </button>

      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
      {urls.length > 0 && (
        <p className="text-xs text-stone-400">
          {urls.length} फोटो · hover करके हटाएं · पोस्ट में slideshow बनेगा
        </p>
      )}
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────────────
export function PostForm({
  post,
  categories,
}: {
  post?: Post;
  categories: { id: string; name: string }[];
}) {
  const d = post?.date
    ? new Date(post.date).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const initialGallery = safeJsonParse<string[]>(post?.images ?? "", []);

  const [mainImageUrl, setMainImageUrl] = useState(post?.mainImage ?? "");
  const [galleryUrls, setGalleryUrls] = useState<string[]>(initialGallery);

  return (
    <form action={savePost} className="space-y-5">
      {post && <input type="hidden" name="id" value={post.id} />}
      {/* Pass image URLs via hidden inputs */}
      <input type="hidden" name="mainImage" value={mainImageUrl} />
      <input type="hidden" name="images" value={JSON.stringify(galleryUrls)} />

      {/* ── आंतरिक शीर्षक ── */}
      <Field label="आंतरिक शीर्षक (Admin के लिए)" required>
        <input
          name="title"
          defaultValue={post?.title}
          required
          className={inputClass}
          placeholder="Admin panel में दिखने वाला नाम"
        />
      </Field>

      {/* ── Public headline ── */}
      <Field label="Public Headline (website पर दिखेगा)">
        <input
          name="headline"
          defaultValue={post?.headline ?? ""}
          className={inputClass}
          placeholder="खाली रखें तो ऊपर वाला शीर्षक use होगा"
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="श्रेणी">
          <select name="categoryId" defaultValue={post?.categoryId ?? ""} className={inputClass}>
            <option value="">— चुनें —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="स्थान">
          <input name="location" defaultValue={post?.location ?? ""} className={inputClass} />
        </Field>
        <Field label="दिनांक">
          <input name="date" type="date" defaultValue={d} className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="रिपोर्टर / संवाददाता">
          <select name="reporter" defaultValue={post?.reporter ?? "NYS टीम"} className={inputClass}>
            <option value="NYS टीम">NYS टीम</option>
            <option value="NYS संवाददाता">NYS संवाददाता</option>
            <option value="कार्यक्रम टीम">कार्यक्रम टीम</option>
            <option value="अधिकृत प्रतिनिधि">अधिकृत प्रतिनिधि</option>
          </select>
        </Field>
        <Field label="प्राथमिकता">
          <select name="priority" defaultValue={post?.priority ?? "NORMAL"} className={inputClass}>
            <option value="NORMAL">सामान्य</option>
            <option value="IMPORTANT">विशेष प्राथमिकता</option>
          </select>
        </Field>
      </div>

      <Field label="संक्षिप्त विवरण (card में दिखेगा — 1–2 वाक्य)">
        <input
          name="excerpt"
          defaultValue={post?.excerpt ?? ""}
          className={inputClass}
          placeholder="उदाहरण: NYS ने ग्रामीण विद्यार्थियों को पुस्तकालय सामग्री वितरित की।"
        />
      </Field>

      <Field label="विस्तृत विवरण / पूरी कहानी" required>
        <textarea
          name="content"
          defaultValue={post?.content}
          rows={10}
          required
          className={inputClass}
          placeholder="यहाँ पूरा विवरण लिखें..."
        />
      </Field>

      {/* ── मुख्य चित्र ── */}
      <fieldset className="rounded-xl border border-stone-200 p-4">
        <legend className="px-1 text-sm font-bold text-stone-700">🖼 मुख्य चित्र (Cover Image)</legend>
        <MainImagePicker value={mainImageUrl} onChange={setMainImageUrl} />
      </fieldset>

      {/* ── Gallery / Extra Photos ── */}
      <fieldset className="rounded-xl border border-stone-200 p-4">
        <legend className="px-1 text-sm font-bold text-stone-700">📷 गैलरी फोटो (एक से अधिक)</legend>
        <p className="mb-3 text-xs text-stone-500">
          इन फोटो को पोस्ट में slideshow की तरह दिखाया जाएगा — स्वाइप करके देख सकते हैं।
        </p>
        <GalleryPicker urls={galleryUrls} onChange={setGalleryUrls} />
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="YouTube URL">
          <input name="youtubeUrl" defaultValue={post?.youtubeUrl ?? ""} className={inputClass} />
        </Field>
        <Field label="Facebook URL">
          <input name="facebookUrl" defaultValue={post?.facebookUrl ?? ""} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="प्रभाव संख्या">
            <input name="impactNumber" type="number" defaultValue={post?.impactNumber ?? ""} className={inputClass} />
          </Field>
          <Field label="प्रभाव लेबल">
            <input name="impactLabel" defaultValue={post?.impactLabel ?? ""} className={inputClass} placeholder="विद्यार्थी" />
          </Field>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <Field label="प्रकाशन स्थिति">
          <select name="status" defaultValue={post?.status ?? "DRAFT"} className={inputClass}>
            {POST_STATUS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <label className="mt-5 flex cursor-pointer items-center gap-2 text-sm text-stone-600">
          <input type="checkbox" name="featured" defaultChecked={post?.featured} className="h-4 w-4 rounded" />
          <span>⭐ Featured / विशेष (होमपेज पर बड़ा दिखेगा)</span>
        </label>
      </div>

      <button className="rounded-xl bg-saffron-600 px-6 py-2.5 font-semibold text-white hover:bg-saffron-700">
        सहेजें
      </button>
    </form>
  );
}
