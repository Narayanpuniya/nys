"use client";
import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";

const PURPOSES = [
  { value: "GENERAL",     label: "सामान्य दान" },
  { value: "EDUCATION",   label: "शिक्षा" },
  { value: "HEALTH",      label: "स्वास्थ्य" },
  { value: "SPORTS",      label: "खेलकूद" },
  { value: "ENVIRONMENT", label: "पर्यावरण" },
  { value: "EVENTS",      label: "कार्यक्रम" },
  { value: "OTHER",       label: "अन्य" },
];
const MODES = [
  { value: "CASH",          label: "नकद (Cash)" },
  { value: "UPI",           label: "UPI" },
  { value: "BANK_TRANSFER", label: "बैंक ट्रांसफर" },
  { value: "CHEQUE",        label: "चेक" },
  { value: "ONLINE",        label: "ऑनलाइन" },
];

export function AddDonationModal() {
  const [open, setOpen]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    donorName:  "",
    mobile:     "",
    amount:     "",
    purpose:    "GENERAL",
    mode:       "CASH",
    status:     "SUCCESS",
    paidAt:     new Date().toISOString().split("T")[0],
    message:    "",
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");

    try {
      const res = await fetch("/api/admin/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }

      setSuccess(`✅ दान जोड़ा गया! रसीद: ${data.receiptNumber}`);
      setForm({
        donorName: "", mobile: "", amount: "",
        purpose: "GENERAL", mode: "CASH", status: "SUCCESS",
        paidAt: new Date().toISOString().split("T")[0], message: "",
      });
      // 2 seconds बाद page refresh करो नया data दिखाने के लिए
      setTimeout(() => { window.location.reload(); }, 2000);
    } catch {
      setError("❌ Server से connection नहीं हो पाया।");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-ink outline-none focus:border-saffron-400 focus:bg-white focus:ring-2 focus:ring-saffron-100";
  const lbl = "block text-xs font-semibold text-stone-600 mb-1";

  return (
    <>
      {/* Add button */}
      <button
        onClick={() => { setOpen(true); setError(""); setSuccess(""); }}
        className="flex items-center gap-2 rounded-xl bg-saffron-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-saffron-700 transition-colors"
      >
        <Plus className="h-4 w-4" /> दान जोड़ें
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <h2 className="text-lg font-extrabold text-ink">➕ नया दान जोड़ें</h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-stone-100">
                <X className="h-5 w-5 text-stone-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
              )}
              {success && (
                <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{success}</div>
              )}

              {/* Row 1: Name + Mobile */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>दानदाता का नाम *</label>
                  <input
                    type="text" required value={form.donorName}
                    onChange={e => set("donorName", e.target.value)}
                    placeholder="पूरा नाम" className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>मोबाइल नंबर</label>
                  <input
                    type="tel" value={form.mobile}
                    onChange={e => set("mobile", e.target.value)}
                    placeholder="9876543210" className={inp}
                  />
                </div>
              </div>

              {/* Row 2: Amount + Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>राशि (₹) *</label>
                  <input
                    type="number" required min={1} value={form.amount}
                    onChange={e => set("amount", e.target.value)}
                    placeholder="1000" className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>दिनांक</label>
                  <input
                    type="date" value={form.paidAt}
                    onChange={e => set("paidAt", e.target.value)}
                    className={inp}
                  />
                </div>
              </div>

              {/* Row 3: Purpose + Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>उद्देश्य</label>
                  <select value={form.purpose} onChange={e => set("purpose", e.target.value)} className={inp}>
                    {PURPOSES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>भुगतान माध्यम</label>
                  <select value={form.mode} onChange={e => set("mode", e.target.value)} className={inp}>
                    {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className={lbl}>स्थिति</label>
                <div className="flex gap-3">
                  {[
                    { v: "SUCCESS", l: "✓ सफल", cls: "border-green-300 bg-green-50 text-green-700" },
                    { v: "PENDING", l: "⏳ लंबित", cls: "border-amber-300 bg-amber-50 text-amber-700" },
                  ].map(({ v, l, cls }) => (
                    <button
                      key={v} type="button"
                      onClick={() => set("status", v)}
                      className={`flex-1 rounded-xl border-2 py-2 text-sm font-semibold transition-all ${
                        form.status === v ? cls : "border-stone-200 bg-white text-stone-500"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className={lbl}>संदेश / टिप्पणी (वैकल्पिक)</label>
                <textarea
                  value={form.message}
                  onChange={e => set("message", e.target.value)}
                  placeholder="दानदाता का संदेश या कोई नोट..."
                  rows={2}
                  className={`${inp} resize-none`}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-saffron-600 py-2.5 text-sm font-semibold text-white hover:bg-saffron-700 disabled:opacity-60"
                >
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> सहेज रहे हैं...</> : "💾 दान सहेजें"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
