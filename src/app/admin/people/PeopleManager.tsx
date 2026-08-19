"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, X, User, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
type TeamMember = {
  id: string; name: string; designation: string; designationKey: string;
  photoUrl: string | null; mobile: string | null; bio: string | null;
  responsibility: string | null; isLeadership: boolean; showMobile: boolean; sortOrder: number;
};
type Mentor = {
  id: string; name: string; designation: string | null; profession: string | null;
  photoUrl: string | null; intro: string | null; contribution: string | null;
  contact: string | null; featured: boolean; showContact: boolean; sortOrder: number;
};

const DESIGNATION_KEYS = ["PRESIDENT","VICE_PRESIDENT","SECRETARY","JOINT_SECRETARY","TREASURER","EXECUTIVE_MEMBER","MEMBER"];
const DESIGNATION_LABELS: Record<string,string> = {
  PRESIDENT: "अध्यक्ष", VICE_PRESIDENT: "उपाध्यक्ष", SECRETARY: "सचिव",
  JOINT_SECRETARY: "सह-सचिव", TREASURER: "कोषाध्यक्ष",
  EXECUTIVE_MEMBER: "कार्यकारिणी सदस्य", MEMBER: "सदस्य",
};

const inp = "w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-ink outline-none focus:border-saffron-400 focus:bg-white focus:ring-2 focus:ring-saffron-100";

// ── TeamSection ───────────────────────────────────────────────────────────────
export function TeamSection({ initialTeam }: { initialTeam: TeamMember[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const emptyTeam: Omit<TeamMember,"id"> = {
    name:"", designation:"", designationKey:"MEMBER", photoUrl:null,
    mobile:null, bio:null, responsibility:null, isLeadership:false, showMobile:false, sortOrder:0,
  };
  const [form, setForm] = useState<Omit<TeamMember,"id">>(emptyTeam);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  function openAdd() { setForm(emptyTeam); setPhotoPreview(null); setEditing(null); setAdding(true); setError(""); }
  function openEdit(t: TeamMember) {
    setForm({ name:t.name, designation:t.designation, designationKey:t.designationKey,
      photoUrl:t.photoUrl, mobile:t.mobile, bio:t.bio, responsibility:t.responsibility,
      isLeadership:t.isLeadership, showMobile:t.showMobile, sortOrder:t.sortOrder });
    setPhotoPreview(t.photoUrl);
    setEditing(t); setAdding(false); setError("");
  }
  function close() { setAdding(false); setEditing(null); setPhotoPreview(null); }

  async function save() {
    if (!form.name.trim()) { setError("नाम आवश्यक है।"); return; }
    setSaving(true); setError("");
    const fd = new FormData(formRef.current!);
    fd.set("isLeadership", String(form.isLeadership));
    fd.set("showMobile", String(form.showMobile));
    fd.set("sortOrder", String(form.sortOrder));
    if (editing) fd.set("id", editing.id);

    const res = await fetch("/api/admin/team", { method: editing ? "PATCH" : "POST", body: fd });
    setSaving(false);
    if (!res.ok) { setError("सहेजने में त्रुटि।"); return; }
    close(); router.refresh();
  }

  async function del(id: string) {
    if (!confirm("इस टीम सदस्य को हटाएँ?")) return;
    setDeleting(id);
    await fetch("/api/admin/team", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id}) });
    setDeleting(null); router.refresh();
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold text-ink">टीम ({initialTeam.length})</h2>
        <button onClick={openAdd} className="flex items-center gap-1.5 rounded-lg bg-saffron-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-saffron-700">
          <Plus className="h-4 w-4" /> जोड़ें
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-stone-100">
        {initialTeam.map((t) => (
          <div key={t.id} className="flex items-center gap-3 py-2.5">
            {t.photoUrl
              ? <img src={t.photoUrl} alt={t.name} className="h-9 w-9 rounded-full object-cover" />
              : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-saffron-100 text-saffron-700"><User className="h-4 w-4"/></span>}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{t.name}</p>
              <p className="text-xs text-stone-500">{t.designation}</p>
            </div>
            {t.isLeadership && <span className="rounded-full bg-saffron-100 px-2 py-0.5 text-xs font-medium text-saffron-700">नेतृत्व</span>}
            <button onClick={() => openEdit(t)} className="text-stone-400 hover:text-saffron-600"><Pencil className="h-4 w-4"/></button>
            <button onClick={() => del(t.id)} disabled={deleting===t.id} className="text-stone-400 hover:text-red-600 disabled:opacity-40">
              {deleting===t.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
            </button>
          </div>
        ))}
        {initialTeam.length === 0 && <p className="py-4 text-sm text-stone-400">कोई सदस्य नहीं — जोड़ें बटन दबाएँ।</p>}
      </div>

      {/* Modal */}
      {(adding || editing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e)=>e.target===e.currentTarget&&close()}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-ink">{editing ? "टीम सदस्य संपादित करें" : "नया टीम सदस्य जोड़ें"}</h3>
              <button onClick={close}><X className="h-5 w-5 text-stone-400"/></button>
            </div>
            <form ref={formRef} className="space-y-3">
              {/* Photo */}
              <div className="flex items-center gap-3">
                {photoPreview
                  ? <img src={photoPreview} alt="" className="h-16 w-16 rounded-full object-cover"/>
                  : <span className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-400"><User className="h-7 w-7"/></span>}
                <label className="cursor-pointer rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-600 hover:border-saffron-400">
                  फ़ोटो चुनें
                  <input type="file" name="photo" accept="image/*" className="hidden"
                    onChange={(e)=>{ const f=e.target.files?.[0]; if(f) setPhotoPreview(URL.createObjectURL(f)); }}/>
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><label className="mb-1 block text-xs font-medium text-ink">नाम *</label>
                  <input name="name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className={inp}/></div>
                <div><label className="mb-1 block text-xs font-medium text-ink">पद</label>
                  <input name="designation" value={form.designation} onChange={e=>setForm(f=>({...f,designation:e.target.value}))} placeholder="जैसे: अध्यक्ष" className={inp}/></div>
                <div><label className="mb-1 block text-xs font-medium text-ink">पद श्रेणी</label>
                  <select name="designationKey" value={form.designationKey} onChange={e=>setForm(f=>({...f,designationKey:e.target.value}))} className={inp}>
                    {DESIGNATION_KEYS.map(k=><option key={k} value={k}>{DESIGNATION_LABELS[k]}</option>)}
                  </select></div>
                <div><label className="mb-1 block text-xs font-medium text-ink">मोबाइल</label>
                  <input name="mobile" value={form.mobile??""} onChange={e=>setForm(f=>({...f,mobile:e.target.value||null}))} className={inp}/></div>
                <div className="sm:col-span-2"><label className="mb-1 block text-xs font-medium text-ink">जिम्मेदारी</label>
                  <input name="responsibility" value={form.responsibility??""} onChange={e=>setForm(f=>({...f,responsibility:e.target.value||null}))} className={inp}/></div>
                <div className="sm:col-span-2"><label className="mb-1 block text-xs font-medium text-ink">परिचय</label>
                  <textarea name="bio" rows={2} value={form.bio??""} onChange={e=>setForm(f=>({...f,bio:e.target.value||null}))} className={inp}/></div>
                <div><label className="mb-1 block text-xs font-medium text-ink">क्रम (Sort Order)</label>
                  <input type="number" name="sortOrder" value={form.sortOrder} onChange={e=>setForm(f=>({...f,sortOrder:+e.target.value}))} className={inp}/></div>
              </div>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isLeadership} onChange={e=>setForm(f=>({...f,isLeadership:e.target.checked}))}/>
                  नेतृत्व टीम
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.showMobile} onChange={e=>setForm(f=>({...f,showMobile:e.target.checked}))}/>
                  मोबाइल दिखाएँ
                </label>
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

// ── MentorSection ─────────────────────────────────────────────────────────────
export function MentorSection({ initialMentors }: { initialMentors: Mentor[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Mentor | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const emptyMentor: Omit<Mentor,"id"> = {
    name:"", designation:null, profession:null, photoUrl:null,
    intro:null, contribution:null, contact:null, featured:false, showContact:false, sortOrder:0,
  };
  const [form, setForm] = useState<Omit<Mentor,"id">>(emptyMentor);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  function openAdd() { setForm(emptyMentor); setPhotoPreview(null); setEditing(null); setAdding(true); setError(""); }
  function openEdit(m: Mentor) {
    setForm({ name:m.name, designation:m.designation, profession:m.profession, photoUrl:m.photoUrl,
      intro:m.intro, contribution:m.contribution, contact:m.contact,
      featured:m.featured, showContact:m.showContact, sortOrder:m.sortOrder });
    setPhotoPreview(m.photoUrl); setEditing(m); setAdding(false); setError("");
  }
  function close() { setAdding(false); setEditing(null); setPhotoPreview(null); }

  async function save() {
    if (!form.name.trim()) { setError("नाम आवश्यक है।"); return; }
    setSaving(true); setError("");
    const fd = new FormData(formRef.current!);
    fd.set("featured", String(form.featured));
    fd.set("showContact", String(form.showContact));
    fd.set("sortOrder", String(form.sortOrder));
    if (editing) fd.set("id", editing.id);

    const res = await fetch("/api/admin/mentors", { method: editing ? "PATCH" : "POST", body: fd });
    setSaving(false);
    if (!res.ok) { setError("सहेजने में त्रुटि।"); return; }
    close(); router.refresh();
  }

  async function del(id: string) {
    if (!confirm("इस मार्गदर्शक को हटाएँ?")) return;
    setDeleting(id);
    await fetch("/api/admin/mentors", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id}) });
    setDeleting(null); router.refresh();
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold text-ink">मार्गदर्शक ({initialMentors.length})</h2>
        <button onClick={openAdd} className="flex items-center gap-1.5 rounded-lg bg-saffron-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-saffron-700">
          <Plus className="h-4 w-4" /> जोड़ें
        </button>
      </div>

      <div className="divide-y divide-stone-100">
        {initialMentors.map((m) => (
          <div key={m.id} className="flex items-center gap-3 py-2.5">
            {m.photoUrl
              ? <img src={m.photoUrl} alt={m.name} className="h-9 w-9 rounded-full object-cover"/>
              : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600"><Star className="h-4 w-4"/></span>}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{m.name}</p>
              <p className="text-xs text-stone-500">{m.designation ?? m.profession}</p>
            </div>
            {m.featured && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">विशेष</span>}
            <button onClick={() => openEdit(m)} className="text-stone-400 hover:text-saffron-600"><Pencil className="h-4 w-4"/></button>
            <button onClick={() => del(m.id)} disabled={deleting===m.id} className="text-stone-400 hover:text-red-600 disabled:opacity-40">
              {deleting===m.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
            </button>
          </div>
        ))}
        {initialMentors.length === 0 && <p className="py-4 text-sm text-stone-400">कोई मार्गदर्शक नहीं — जोड़ें बटन दबाएँ।</p>}
      </div>

      {(adding || editing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e)=>e.target===e.currentTarget&&close()}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-ink">{editing ? "मार्गदर्शक संपादित करें" : "नया मार्गदर्शक जोड़ें"}</h3>
              <button onClick={close}><X className="h-5 w-5 text-stone-400"/></button>
            </div>
            <form ref={formRef} className="space-y-3">
              <div className="flex items-center gap-3">
                {photoPreview
                  ? <img src={photoPreview} alt="" className="h-16 w-16 rounded-full object-cover"/>
                  : <span className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-400"><User className="h-7 w-7"/></span>}
                <label className="cursor-pointer rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-600 hover:border-saffron-400">
                  फ़ोटो चुनें
                  <input type="file" name="photo" accept="image/*" className="hidden"
                    onChange={(e)=>{ const f=e.target.files?.[0]; if(f) setPhotoPreview(URL.createObjectURL(f)); }}/>
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><label className="mb-1 block text-xs font-medium text-ink">नाम *</label>
                  <input name="name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className={inp}/></div>
                <div><label className="mb-1 block text-xs font-medium text-ink">पदनाम</label>
                  <input name="designation" value={form.designation??""} onChange={e=>setForm(f=>({...f,designation:e.target.value||null}))} placeholder="जैसे: शिक्षाविद्" className={inp}/></div>
                <div><label className="mb-1 block text-xs font-medium text-ink">पेशा</label>
                  <input name="profession" value={form.profession??""} onChange={e=>setForm(f=>({...f,profession:e.target.value||null}))} className={inp}/></div>
                <div><label className="mb-1 block text-xs font-medium text-ink">संपर्क</label>
                  <input name="contact" value={form.contact??""} onChange={e=>setForm(f=>({...f,contact:e.target.value||null}))} className={inp}/></div>
                <div className="sm:col-span-2"><label className="mb-1 block text-xs font-medium text-ink">परिचय</label>
                  <textarea name="intro" rows={2} value={form.intro??""} onChange={e=>setForm(f=>({...f,intro:e.target.value||null}))} className={inp}/></div>
                <div className="sm:col-span-2"><label className="mb-1 block text-xs font-medium text-ink">योगदान</label>
                  <textarea name="contribution" rows={2} value={form.contribution??""} onChange={e=>setForm(f=>({...f,contribution:e.target.value||null}))} className={inp}/></div>
                <div><label className="mb-1 block text-xs font-medium text-ink">क्रम (Sort Order)</label>
                  <input type="number" name="sortOrder" value={form.sortOrder} onChange={e=>setForm(f=>({...f,sortOrder:+e.target.value}))} className={inp}/></div>
              </div>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e=>setForm(f=>({...f,featured:e.target.checked}))}/>
                  विशेष (Featured)
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.showContact} onChange={e=>setForm(f=>({...f,showContact:e.target.checked}))}/>
                  संपर्क दिखाएँ
                </label>
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
