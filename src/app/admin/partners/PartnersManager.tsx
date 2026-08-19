"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, X, Building2, PlusCircle, MinusCircle } from "lucide-react";

type Program = { id?: string; title: string; impactLabel: string; impactValue: string };
type Partner = {
  id: string; name: string; slug: string; about: string | null; website: string | null;
  socialLinks: string | null; contribution: string | null; featured: boolean;
  logoUrl: string | null; programs: { id: string; title: string; impactLabel: string | null; impactValue: number | null }[];
};

const inp = "w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-ink outline-none focus:border-saffron-400 focus:bg-white focus:ring-2 focus:ring-saffron-100";

const emptyPartner = {
  name:"", about:"", website:"", socialLinks:"", contribution:"", featured:false, logoUrl: null as string|null,
};

export function PartnersManager({ initialPartners }: { initialPartners: Partner[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Partner | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyPartner);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function openAdd() {
    setForm(emptyPartner); setPrograms([]); setLogoPreview(null);
    setEditing(null); setAdding(true); setError("");
  }
  function openEdit(p: Partner) {
    setForm({ name:p.name, about:p.about??"", website:p.website??"", socialLinks:p.socialLinks??"",
      contribution:p.contribution??"", featured:p.featured, logoUrl:p.logoUrl });
    setPrograms(p.programs.map(pr => ({ id:pr.id, title:pr.title, impactLabel:pr.impactLabel??"", impactValue:String(pr.impactValue??"") })));
    setLogoPreview(p.logoUrl); setEditing(p); setAdding(false); setError("");
  }
  function close() { setAdding(false); setEditing(null); setLogoPreview(null); }

  function addProgram() { setPrograms(ps => [...ps, { title:"", impactLabel:"", impactValue:"" }]); }
  function removeProgram(i: number) { setPrograms(ps => ps.filter((_,j)=>j!==i)); }
  function setProgram(i: number, k: keyof Program, v: string) {
    setPrograms(ps => ps.map((p,j) => j===i ? {...p,[k]:v} : p));
  }

  async function save() {
    if (!form.name.trim()) { setError("नाम आवश्यक है।"); return; }
    setSaving(true); setError("");
    const fd = new FormData(formRef.current!);
    fd.set("featured", String(form.featured));
    fd.set("programs", JSON.stringify(programs.map(p => ({
      title: p.title, impactLabel: p.impactLabel,
      impactValue: p.impactValue ? parseInt(p.impactValue) : undefined,
    }))));
    if (editing) fd.set("id", editing.id);

    const res = await fetch("/api/admin/partners", { method: editing ? "PATCH" : "POST", body: fd });
    setSaving(false);
    if (!res.ok) { const d=await res.json(); setError(d.error??"सहेजने में त्रुटि।"); return; }
    close(); router.refresh();
  }

  async function del(id: string, name: string) {
    if (!confirm(`"${name}" को हटाएँ?`)) return;
    setDeleting(id);
    await fetch("/api/admin/partners", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id}) });
    setDeleting(null); router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-stone-500">{initialPartners.length} संस्थान</p>
        <button onClick={openAdd} className="flex items-center gap-1.5 rounded-lg bg-saffron-600 px-4 py-2 text-sm font-semibold text-white hover:bg-saffron-700">
          <Plus className="h-4 w-4" /> नया संस्थान जोड़ें
        </button>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {initialPartners.map((p) => (
          <div key={p.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                {p.logoUrl
                  ? <img src={p.logoUrl} alt={p.name} className="h-10 w-10 rounded-lg object-contain border border-stone-100"/>
                  : <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-400"><Building2 className="h-5 w-5"/></span>}
                <div>
                  <h3 className="font-bold text-ink leading-tight">{p.name}</h3>
                  {p.featured && <span className="text-xs text-saffron-700 font-medium">★ Featured</span>}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-saffron-600"><Pencil className="h-4 w-4"/></button>
                <button onClick={() => del(p.id, p.name)} disabled={deleting===p.id} className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40">
                  {deleting===p.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
                </button>
              </div>
            </div>
            {p.about && <p className="mt-2 line-clamp-2 text-sm text-stone-500">{p.about}</p>}
            {p.programs.length > 0 && (
              <p className="mt-2 text-xs text-saffron-700">{p.programs.length} संयुक्त कार्यक्रम</p>
            )}
            {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-blue-600 hover:underline truncate">{p.website}</a>}
          </div>
        ))}
        {initialPartners.length === 0 && (
          <div className="col-span-3 rounded-2xl border-2 border-dashed border-stone-200 p-10 text-center text-sm text-stone-400">
            कोई सहयोगी संस्थान नहीं — ऊपर "नया संस्थान जोड़ें" बटन दबाएँ।
          </div>
        )}
      </div>

      {/* Modal */}
      {(adding || editing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e)=>e.target===e.currentTarget&&close()}>
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-ink">{editing ? "संस्थान संपादित करें" : "नया सहयोगी संस्थान"}</h3>
              <button onClick={close}><X className="h-5 w-5 text-stone-400"/></button>
            </div>

            <form ref={formRef} className="space-y-3">
              {/* Logo */}
              <div className="flex items-center gap-3">
                {logoPreview
                  ? <img src={logoPreview} alt="" className="h-14 w-14 rounded-lg object-contain border border-stone-200"/>
                  : <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-stone-100 text-stone-400"><Building2 className="h-6 w-6"/></span>}
                <label className="cursor-pointer rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-600 hover:border-saffron-400">
                  लोगो चुनें
                  <input type="file" name="logo" accept="image/*" className="hidden"
                    onChange={e=>{ const f=e.target.files?.[0]; if(f) setLogoPreview(URL.createObjectURL(f)); }}/>
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-ink">संस्थान नाम *</label>
                  <input name="name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className={inp}/>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-ink">परिचय</label>
                  <textarea name="about" rows={2} value={form.about} onChange={e=>setForm(f=>({...f,about:e.target.value}))} className={inp}/>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink">वेबसाइट</label>
                  <input name="website" type="url" value={form.website} onChange={e=>setForm(f=>({...f,website:e.target.value}))} placeholder="https://" className={inp}/>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink">सोशल लिंक्स</label>
                  <input name="socialLinks" value={form.socialLinks} onChange={e=>setForm(f=>({...f,socialLinks:e.target.value}))} placeholder="Facebook, Instagram आदि URL" className={inp}/>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-ink">योगदान</label>
                  <textarea name="contribution" rows={2} value={form.contribution} onChange={e=>setForm(f=>({...f,contribution:e.target.value}))} className={inp}/>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={form.featured} onChange={e=>setForm(f=>({...f,featured:e.target.checked}))}/>
                    Featured (मुख्य पृष्ठ पर दिखाएँ)
                  </label>
                </div>
              </div>

              {/* Programs */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium text-ink">संयुक्त कार्यक्रम</label>
                  <button type="button" onClick={addProgram} className="flex items-center gap-1 text-xs text-saffron-700 hover:text-saffron-800">
                    <PlusCircle className="h-3.5 w-3.5"/> कार्यक्रम जोड़ें
                  </button>
                </div>
                <div className="space-y-2">
                  {programs.map((pr, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 p-2">
                      <input value={pr.title} onChange={e=>setProgram(i,"title",e.target.value)} placeholder="कार्यक्रम नाम" className="flex-1 rounded border border-stone-200 bg-white px-2 py-1 text-xs outline-none focus:border-saffron-400"/>
                      <input value={pr.impactLabel} onChange={e=>setProgram(i,"impactLabel",e.target.value)} placeholder="प्रभाव लेबल" className="w-24 rounded border border-stone-200 bg-white px-2 py-1 text-xs outline-none focus:border-saffron-400"/>
                      <input type="number" value={pr.impactValue} onChange={e=>setProgram(i,"impactValue",e.target.value)} placeholder="संख्या" className="w-16 rounded border border-stone-200 bg-white px-2 py-1 text-xs outline-none focus:border-saffron-400"/>
                      <button type="button" onClick={()=>removeProgram(i)} className="text-red-400 hover:text-red-600"><MinusCircle className="h-4 w-4"/></button>
                    </div>
                  ))}
                  {programs.length === 0 && <p className="text-xs text-stone-400">कोई कार्यक्रम नहीं।</p>}
                </div>
              </div>

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">⚠️ {error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={close} className="rounded-lg border border-stone-200 px-4 py-2 text-sm">रद्द करें</button>
                <button type="button" onClick={save} disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-saffron-600 px-4 py-2 text-sm font-semibold text-white hover:bg-saffron-700 disabled:opacity-60">
                  {saving && <Loader2 className="h-4 w-4 animate-spin"/>} सहेजें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
