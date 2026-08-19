"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, X, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { ROLE_LABELS, type Role } from "@/lib/constants";

type User = { id: string; name: string; email: string; role: string; isActive: boolean; lastLoginAt: Date | null };

const ROLES: Role[] = ["SUPER_ADMIN","PRESIDENT","SECRETARY","TREASURER","CONTENT_MANAGER","EVENT_MANAGER"];
const inp = "w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-ink outline-none focus:border-saffron-400 focus:bg-white focus:ring-2 focus:ring-saffron-100";

type Mode = "add" | "edit" | "password" | null;

export function UsersManager({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const [target, setTarget] = useState<User | null>(null);
  const [form, setForm] = useState({ name:"", email:"", role:"CONTENT_MANAGER", password:"", confirmPassword:"" });
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string|null>(null);
  const [error, setError] = useState("");

  function openAdd() {
    setForm({ name:"", email:"", role:"CONTENT_MANAGER", password:"", confirmPassword:"" });
    setError(""); setMode("add");
  }
  function openEdit(u: User) {
    setForm({ name:u.name, email:u.email, role:u.role, password:"", confirmPassword:"" });
    setTarget(u); setError(""); setMode("edit");
  }
  function openPassword(u: User) {
    setNewPassword(""); setConfirmNew(""); setTarget(u); setError(""); setMode("password");
  }
  function close() { setMode(null); setTarget(null); setError(""); }

  async function saveAdd() {
    if (!form.name.trim() || !form.email.trim()) { setError("नाम और ईमेल आवश्यक हैं।"); return; }
    if (form.password.length < 6) { setError("पासवर्ड कम से कम 6 अक्षर का होना चाहिए।"); return; }
    if (form.password !== form.confirmPassword) { setError("पासवर्ड मेल नहीं खाते।"); return; }
    setSaving(true); setError("");
    const res = await fetch("/api/admin/users", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ name:form.name, email:form.email, role:form.role, password:form.password }) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "त्रुटि हुई।"); return; }
    close(); router.refresh();
  }

  async function saveEdit() {
    if (!form.name.trim() || !form.email.trim()) { setError("नाम और ईमेल आवश्यक हैं।"); return; }
    setSaving(true); setError("");
    const res = await fetch("/api/admin/users", { method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id:target!.id, name:form.name, email:form.email, role:form.role }) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "त्रुटि हुई।"); return; }
    close(); router.refresh();
  }

  async function savePassword() {
    if (newPassword.length < 6) { setError("पासवर्ड कम से कम 6 अक्षर का होना चाहिए।"); return; }
    if (newPassword !== confirmNew) { setError("पासवर्ड मेल नहीं खाते।"); return; }
    setSaving(true); setError("");
    const res = await fetch("/api/admin/users", { method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id:target!.id, newPassword }) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "त्रुटि हुई।"); return; }
    close(); router.refresh();
  }

  async function toggleActive(u: User) {
    await fetch("/api/admin/users", { method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id:u.id, isActive:!u.isActive }) });
    router.refresh();
  }

  async function del(u: User) {
    if (!confirm(`"${u.name}" को delete करें?`)) return;
    setDeleting(u.id);
    const res = await fetch("/api/admin/users", { method:"DELETE", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id:u.id }) });
    const data = await res.json();
    setDeleting(null);
    if (!res.ok) { alert(data.error ?? "delete नहीं हो सका।"); return; }
    router.refresh();
  }

  function fmt(d: Date | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("hi-IN", { day:"numeric", month:"long", year:"numeric" });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-stone-500">भूमिका-आधारित पहुँच नियंत्रण (RBAC)</p>
        <button onClick={openAdd} className="flex items-center gap-1.5 rounded-lg bg-saffron-600 px-4 py-2 text-sm font-semibold text-white hover:bg-saffron-700">
          <Plus className="h-4 w-4"/> नया उपयोगकर्ता
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs text-stone-500">
            <tr>
              <th className="px-4 py-3">नाम</th>
              <th className="px-4 py-3">ईमेल</th>
              <th className="px-4 py-3">भूमिका</th>
              <th className="px-4 py-3">स्थिति</th>
              <th className="px-4 py-3">अंतिम लॉगिन</th>
              <th className="px-4 py-3">क्रिया</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users.map((u) => (
              <tr key={u.id} className={u.id === currentUserId ? "bg-saffron-50/40" : ""}>
                <td className="px-4 py-3 font-medium text-ink">
                  {u.name}
                  {u.id === currentUserId && <span className="ml-1.5 text-xs text-saffron-600">(आप)</span>}
                </td>
                <td className="px-4 py-3 text-stone-600">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge tone="saffron">{ROLE_LABELS[u.role as Role] ?? u.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => u.id !== currentUserId && toggleActive(u)}
                    className={u.id === currentUserId ? "cursor-default" : "cursor-pointer"}>
                    <Badge tone={u.isActive ? "green" : "neutral"}>{u.isActive ? "सक्रिय" : "निष्क्रिय"}</Badge>
                  </button>
                </td>
                <td className="px-4 py-3 text-stone-400">{fmt(u.lastLoginAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={()=>openEdit(u)} title="संपादित करें"
                      className="rounded p-1.5 text-stone-400 hover:bg-stone-100 hover:text-saffron-600"><Pencil className="h-3.5 w-3.5"/></button>
                    <button onClick={()=>openPassword(u)} title="पासवर्ड बदलें"
                      className="rounded p-1.5 text-stone-400 hover:bg-stone-100 hover:text-blue-600"><KeyRound className="h-3.5 w-3.5"/></button>
                    {u.id !== currentUserId && (
                      <button onClick={()=>del(u)} disabled={deleting===u.id} title="हटाएँ"
                        className="rounded p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40">
                        {deleting===u.id ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Trash2 className="h-3.5 w-3.5"/>}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* भूमिका विवरण */}
      <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-stone-600"><ShieldCheck className="h-3.5 w-3.5"/> भूमिका व अधिकार</p>
        <div className="grid gap-1 text-xs text-stone-500 sm:grid-cols-2">
          <span>🔴 सुपर एडमिन — सभी अधिकार</span>
          <span>🟠 अध्यक्ष — रिपोर्ट, स्वीकृति, दान, अभियान</span>
          <span>🟡 सचिव — सदस्य, कार्यक्रम, पोस्ट, रिपोर्ट</span>
          <span>🟢 कोषाध्यक्ष — वित्त, दान, रिपोर्ट</span>
          <span>🔵 कंटेंट मैनेजर — पोस्ट, गैलरी, वीडियो</span>
          <span>🟣 इवेंट मैनेजर — कार्यक्रम, पंजीकरण</span>
        </div>
      </div>

      {/* ── Modal: Add ────────────────────────────────────────────────────────── */}
      {mode === "add" && (
        <Modal title="नया एडमिन उपयोगकर्ता" onClose={close}>
          <div className="space-y-3">
            <Row label="नाम *"><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className={inp}/></Row>
            <Row label="ईमेल *"><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className={inp}/></Row>
            <Row label="भूमिका">
              <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} className={inp}>
                {ROLES.map(r=><option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </Row>
            <Row label="पासवर्ड *">
              <div className="relative">
                <input type={showPw?"text":"password"} value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="कम से कम 6 अक्षर" className={`${inp} pr-10`}/>
                <button type="button" onClick={()=>setShowPw(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">{showPw?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button>
              </div>
            </Row>
            <Row label="पासवर्ड पुष्टि *">
              <input type="password" value={form.confirmPassword} onChange={e=>setForm(f=>({...f,confirmPassword:e.target.value}))}
                className={`${inp} ${form.confirmPassword&&form.password!==form.confirmPassword?"border-red-400":""}`}/>
              {form.confirmPassword&&form.password!==form.confirmPassword&&<p className="mt-1 text-xs text-red-600">पासवर्ड मेल नहीं खाते</p>}
            </Row>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">⚠️ {error}</p>}
            <Btns onClose={close} onSave={saveAdd} saving={saving}/>
          </div>
        </Modal>
      )}

      {/* ── Modal: Edit ───────────────────────────────────────────────────────── */}
      {mode === "edit" && (
        <Modal title="उपयोगकर्ता संपादित करें" onClose={close}>
          <div className="space-y-3">
            <Row label="नाम *"><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className={inp}/></Row>
            <Row label="ईमेल *"><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className={inp}/></Row>
            <Row label="भूमिका">
              <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} className={inp}>
                {ROLES.map(r=><option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </Row>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">⚠️ {error}</p>}
            <Btns onClose={close} onSave={saveEdit} saving={saving}/>
          </div>
        </Modal>
      )}

      {/* ── Modal: Password Reset ─────────────────────────────────────────────── */}
      {mode === "password" && (
        <Modal title={`पासवर्ड बदलें — ${target?.name}`} onClose={close}>
          <div className="space-y-3">
            <Row label="नया पासवर्ड *">
              <div className="relative">
                <input type={showPw?"text":"password"} value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="कम से कम 6 अक्षर" className={`${inp} pr-10`}/>
                <button type="button" onClick={()=>setShowPw(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">{showPw?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button>
              </div>
            </Row>
            <Row label="पुष्टि करें *">
              <input type="password" value={confirmNew} onChange={e=>setConfirmNew(e.target.value)}
                className={`${inp} ${confirmNew&&newPassword!==confirmNew?"border-red-400":""}`}/>
              {confirmNew&&newPassword!==confirmNew&&<p className="mt-1 text-xs text-red-600">पासवर्ड मेल नहीं खाते</p>}
            </Row>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">⚠️ {error}</p>}
            <Btns onClose={close} onSave={savePassword} saving={saving} label="पासवर्ड बदलें"/>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: ()=>void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-ink">{title}</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-stone-400"/></button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-xs font-medium text-ink">{label}</label>{children}</div>;
}
function Btns({ onClose, onSave, saving, label="सहेजें" }: { onClose:()=>void; onSave:()=>void; saving:boolean; label?:string }) {
  return (
    <div className="flex justify-end gap-2 pt-1">
      <button type="button" onClick={onClose} className="rounded-lg border border-stone-200 px-4 py-2 text-sm">रद्द करें</button>
      <button type="button" onClick={onSave} disabled={saving}
        className="flex items-center gap-2 rounded-lg bg-saffron-600 px-4 py-2 text-sm font-semibold text-white hover:bg-saffron-700 disabled:opacity-60">
        {saving && <Loader2 className="h-4 w-4 animate-spin"/>}{label}
      </button>
    </div>
  );
}
