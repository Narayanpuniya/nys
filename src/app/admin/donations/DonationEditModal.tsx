"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, Loader2, Save, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { formatINR } from "@/lib/utils";

type Donation = {
  id: string;
  receiptNumber: string;
  donorName: string;
  amount: number;
  purpose: string;
  status: string;
  message: string | null;
  gatewayTxnId: string | null;
  gatewayOrderId: string | null;
  mode: string;
  createdAt: string;
  paidAt: string | null;
  campaign?: { title: string } | null;
  donor?: { mobile?: string | null; email?: string | null } | null;
};

const PURPOSES = [
  { key: "GENERAL",     label: "सामान्य दान" },
  { key: "EDUCATION",   label: "शिक्षा" },
  { key: "SPORTS",      label: "खेल" },
  { key: "ENVIRONMENT", label: "पर्यावरण" },
  { key: "HEALTH",      label: "स्वास्थ्य" },
  { key: "CAMPAIGN",    label: "अभियान" },
];

const inputCls =
  "w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-800 outline-none focus:border-saffron-400 focus:ring-2 focus:ring-saffron-100 transition";

export function DonationEditModal({ donationId, status }: { donationId: string; status: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Editable fields
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");

  async function openModal() {
    setOpen(true);
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/donations/${donationId}`);
      const data = await res.json();
      if (res.ok && data.donation) {
        const d: Donation = data.donation;
        setDonation(d);
        setDonorName(d.donorName);
        setAmount(String(d.amount));
        setPurpose(d.purpose);
        setMessage(d.message ?? "");
      } else {
        setError(data.error ?? "दान लोड नहीं हो सका।");
      }
    } catch { setError("नेटवर्क त्रुटि।"); }
    setLoading(false);
  }

  async function handleSave() {
    setError(""); setSaving(true); setSaved(false);
    const res = await fetch(`/api/admin/donations/${donationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ donorName, amount: parseInt(amount, 10), purpose, message }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) { setSaved(true); if (data.donation) setDonation(data.donation); }
    else setError(data.error ?? "सेव नहीं हो सका।");
  }

  async function handleAction(action: "approve" | "reject") {
    setError(""); setActing(true);
    const res = await fetch("/api/admin/donations/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: donationId, action }),
    });
    const data = await res.json();
    setActing(false);
    if (res.ok) { setOpen(false); router.refresh(); }
    else setError(data.error ?? "कार्रवाई विफल।");
  }

  if (!["PENDING", "PAID"].includes(status)) return null;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={openModal}
        className="flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 shadow-sm transition hover:border-saffron-400 hover:bg-saffron-50"
      >
        <Pencil className="h-3.5 w-3.5" /> एडिट / देखें
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4"
              style={{ background: "linear-gradient(135deg, #d97706 0%, #7f1d1d 100%)" }}>
              <h2 className="text-base font-bold text-white">दान संपादन / सत्यापन</h2>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 text-white/80 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto p-5">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-saffron-600" />
                </div>
              ) : donation ? (
                <div className="space-y-4">

                  {/* Read-only info */}
                  <div className="rounded-xl border border-stone-100 bg-stone-50 p-4 text-xs space-y-1.5 text-stone-600">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="font-semibold text-stone-400">रसीद:</span> {donation.receiptNumber}</div>
                      <div><span className="font-semibold text-stone-400">मोड:</span> {donation.mode}</div>
                      <div><span className="font-semibold text-stone-400">Gateway TxnID:</span> <span className="font-mono break-all">{donation.gatewayTxnId ?? "—"}</span></div>
                      <div><span className="font-semibold text-stone-400">Order ID:</span> <span className="font-mono break-all">{donation.gatewayOrderId ?? "—"}</span></div>
                      {donation.donor?.mobile && <div><span className="font-semibold text-stone-400">मोबाइल:</span> {donation.donor.mobile}</div>}
                      {donation.donor?.email  && <div><span className="font-semibold text-stone-400">ईमेल:</span> {donation.donor.email}</div>}
                      {donation.campaign?.title && <div className="col-span-2"><span className="font-semibold text-stone-400">अभियान:</span> {donation.campaign.title}</div>}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <a href={`/receipt/${donation.receiptNumber}`} target="_blank"
                        className="flex items-center gap-1 text-saffron-700 hover:underline font-semibold">
                        <ExternalLink className="h-3.5 w-3.5" /> रसीद देखें
                      </a>
                    </div>
                  </div>

                  {/* Editable fields */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-stone-600">दानदाता का नाम</label>
                    <input value={donorName} onChange={e => setDonorName(e.target.value)} className={inputCls} />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-stone-600">राशि (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400">₹</span>
                      <input
                        type="number" min="1" value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className={`${inputCls} pl-7`}
                      />
                    </div>
                    {donation.amount !== parseInt(amount || "0", 10) && parseInt(amount || "0", 10) > 0 && (
                      <p className="mt-1 text-[11px] text-amber-700">
                        ⚠️ मूल राशि {formatINR(donation.amount)} → बदली जाएगी {formatINR(parseInt(amount, 10))}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-stone-600">उद्देश्य</label>
                    <select value={purpose} onChange={e => setPurpose(e.target.value)} className={inputCls}>
                      {PURPOSES.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-stone-600">Admin नोट / संदेश</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={2} className={inputCls} placeholder="Admin की टिप्पणी..." />
                  </div>

                  {/* Save button */}
                  <button onClick={handleSave} disabled={saving}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 bg-stone-50 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 disabled:opacity-50">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    बदलाव सेव करें
                  </button>
                  {saved && <p className="text-center text-xs text-green-700 font-semibold">✅ बदलाव सेव हो गए।</p>}
                  {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

                  {/* Approve / Reject */}
                  <div className="border-t border-stone-100 pt-3">
                    <p className="mb-2 text-xs font-bold text-stone-500 uppercase tracking-wider">अंतिम कार्रवाई</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => handleAction("approve")} disabled={acting}
                        className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-60">
                        {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        स्वीकृत करें
                      </button>
                      <button onClick={() => handleAction("reject")} disabled={acting}
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60">
                        {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                        अस्वीकृत करें
                      </button>
                    </div>
                    <p className="mt-2 text-[11px] text-stone-400 text-center">
                      बदलाव सेव करने के बाद ही स्वीकृत/अस्वीकृत करें।
                    </p>
                  </div>

                </div>
              ) : (
                <p className="py-8 text-center text-sm text-red-600">{error}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
