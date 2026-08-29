"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, X, Quote, Eye, EyeOff } from "lucide-react";

type Testimonial = {
  id: string; name: string; designation: string | null;
  message: string; photoUrl: string | null;
  isPublished: boolean; sortOrder: number; createdAt: string;
};

const inp = "w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-ink outline-none focus:border-saffron-400 focus:bg-white focus:ring-2 focus:ring-saffron-100";
const empty = { name: "", designation: "", message: "", isPublished: true, sortOrder: 0 };

export function TestimonialsManager({ initial }: { initial: Testimonial[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(empty);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  function openAdd() {
    setForm(empty); setPhotoPreview(null); setEditing(null); setAdding(true); setError("");
  }
  function openEdit(t: Testimonial) {
    setForm({ name: t.name, designation: t.designation ?? "", message: t.message,
      isPublished: t.isPublished, sortOrder: t.sortOrder });
    setPhotoPreview(t.photoUrl); setEditing(t); setAdding(false); setError("");
  }
  function close() { setAdding(false); setEditing(null); setPhotoPreview(null); }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function save() {
    if (!form.name.trim()) { setError("नाम आवश्यक है।"); return; }
    if (!form.message.trim()) { setError("Message आवश्यक है।"); return; }
    setSaving(true); setError("");
    const fd = new FormData(formRef.current!);
    fd.set("isPublished", String(form.isPublished));
    if (editing) fd.set("id", editing.id);
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: editing ? "PUT" : "POST", body: fd,
      });
      if (!res.ok) throw new Error((await res.json()).error || "Error");
      router.refresh();
      close();
      // Refresh list
      const list = await fetch("/api/admin/testimonials").then(r => r.json());
      setItems(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "कुछ error हुई।");
    } finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm("क्या आप इस testimonial को delete करना चाहते हैं?")) return;
    setDeleting(id);
    try {
      await fetch("/api/admin/testimonials", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      setItems(prev => prev.filter(t => t.id !== id));
    } finally { setDeleting(null); }
  }

  const filtered = items.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.designation ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Testimonials</h1>
          <p className="text-sm text-stone-500">{items.length} testimonial{items.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-saffron-600 px-4 py-2 text-sm font-semibold text-white hover:bg-saffron-700">
          <Plus className="h-4 w-4" /> नया Testimonial जोड़ें
        </button>
      </div>

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="नाम या designation से खोजें..."
        className={inp + " mb-4"} />

      {/* Modal */}
      {(adding || editing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editing ? "Testimonial Edit करें" : "नया Testimonial जोड़ें"}</h2>
              <button onClick={close}><X className="h-5 w-5 text-stone-400" /></button>
            </div>
            <form ref={formRef} className="space-y-4" onSubmit={e => { e.preventDefault(); save(); }}>

              {/* Photo */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Photo (optional)</label>
                <div className="flex items-center gap-3">
                  {photoPreview && (
                    <img src={photoPreview} alt="" className="h-16 w-16 rounded-full object-cover border-2 border-saffron-200" />
                  )}
                  <input type="file" name="photo" accept="image/*" onChange={handlePhoto}
                    className="text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-saffron-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-saffron-700" />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">नाम *</label>
                <input name="name" value={form.name} onChange={f("name")} required
                  placeholder="जैसे: भंवरलाल आर्य" className={inp} />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Designation / पद</label>
                <input name="designation" value={form.designation} onChange={f("designation")}
                  placeholder="जैसे: मुख्य संरक्षक NYS" className={inp} />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Message *</label>
                <textarea name="message" value={form.message} onChange={f("message") as React.ChangeEventHandler<HTMLTextAreaElement>}
                  required rows={5} placeholder="Testimonial लिखें..." className={inp} />
              </div>

              {/* Sort Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Sort Order</label>
                  <input type="number" name="sortOrder" value={form.sortOrder}
                    onChange={e => setForm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                    className={inp} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Published?</label>
                  <button type="button" onClick={() => setForm(p => ({ ...p, isPublished: !p.isPublished }))}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      form.isPublished ? "border-green-300 bg-green-50 text-green-700" : "border-stone-200 bg-stone-50 text-stone-500"}`}>
                    {form.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {form.isPublished ? "Published" : "Hidden"}
                  </button>
                </div>
              </div>

              {error && <p className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-saffron-600 py-2.5 text-sm font-semibold text-white hover:bg-saffron-700 disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {saving ? "Saving..." : editing ? "Update करें" : "Add करें"}
                </button>
                <button type="button" onClick={close}
                  className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-stone-200 py-16 text-center text-stone-400">
            <Quote className="mx-auto mb-2 h-10 w-10 opacity-30" />
            <p className="font-medium">कोई Testimonial नहीं मिला</p>
          </div>
        )}
        {filtered.map(t => (
          <div key={t.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              {/* Photo */}
              {t.photoUrl ? (
                <img src={t.photoUrl} alt={t.name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-saffron-200 flex-shrink-0" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-saffron-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-saffron-600">{t.name[0]}</span>
                </div>
              )}
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h3 className="font-bold text-ink">{t.name}</h3>
                    {t.designation && <p className="text-sm text-stone-500">{t.designation}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      t.isPublished ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                      {t.isPublished ? "✓ Published" : "Hidden"}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed line-clamp-3">{t.message}</p>
              </div>
            </div>
            {/* Actions */}
            <div className="mt-4 flex justify-end gap-2 border-t border-stone-100 pt-3">
              <button onClick={() => openEdit(t)}
                className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              <button onClick={() => del(t.id)} disabled={deleting === t.id}
                className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50">
                {deleting === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
