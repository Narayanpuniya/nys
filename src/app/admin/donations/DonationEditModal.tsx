"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, Loader2, Save, CheckCircle2, XCircle, ExternalLink, FileText, Trash2 } from "lucide-react";
import { formatINR } from "@/lib/utils";

type Donation = {
  id: string;
  receiptNumber: string;
  donorName: string;
  amount: number;
  purpose: string;
  status: string;
  message: string | null;
  proofUrl: string | null;
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
  const [open, setOpen]         = useState(false);
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [acting, setActing]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError]       = useState("");
  const [saved, setSaved]       = useState(false);

  // Editable fields
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount]       = useState("");
  const [purpose, setPurpose]     = useState("");
  const [message, setMessage]     = useState("");

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
    } catch {
      setError("नेटवर्क त्रुटि — दोबारा प्रयास करें।");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setError(""); setSaving(true); setSaved(false);
    try {
      const res = await fetch(`/api/admin/donations/${donationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName,
          amount: parseInt(amount, 10),
          purpose,
          message,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSaved(true);
        // Merge updated fields while keeping donor/campaign relations
        if (data.donation) {
          setDonation((prev) => prev ? { ...prev, ...data.donation, donor: prev.donor, campaign: prev.campaign } : data.donation);
        }
        router.refresh(); // refresh table behind modal
      } else {
        setError(data.error ?? "सेव नहीं हो सका।");
      }
    } catch {
      setError("नेटवर्क त्रुटि — दोबारा प्रयास करें।");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setError(""); setDeleting(true);
    try {
      const res = await fetch(`/api/admin/donations/${donationId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(data.error ?? "हटाया नहीं जा सका।");
      }
    } catch {
      setError("नेटवर्क त्रुटि — दोबारा प्रयास करें।");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handleAction(action: "approve" | "reject") {
    setError(""); setActing(true);
    try {
      const res = await fetch("/api/admin/donations/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: donationId, action }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(data.error ?? "कार्रवाई विफल।");
      }
    } catch {
      setError("नेटवर्क त्रुटि — दोबारा प्रयास करें।");
    } finally {
      setActing(false);
    }
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

      {/* Modal overlay — full screen scroll so nothing gets cut off */}
      {open && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 py-8"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Sticky header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
              style={{ background: "linear-gradient(135deg, #d97706 0%, #7f1d1d 100%)" }}
            >
              <h2 className="text-base font-bold text-white">दान संपादन / सत्यापन</h2>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 text-white/80 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-saffron-600" />
                </div>
              ) : donation ? (
                <div className="space-y-4">

                  {/* ── 1. Payment proof screenshot — सबसे पहले ── */}
                  {donation.proofUrl ? (
                    <div className="rounded-xl border-2 border-green-400 bg-green-50 p-3">
                      <p className="mb-2 text-xs font-bold text-green-800">
                        ✅ भुगतान प्रमाण (दानदाता द्वारा अपलोड)
                      </p>
                      {/\.(jpg|jpeg|png|webp|gif)$/i.test(donation.proofUrl) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={donation.proofUrl}
                          alt="payment proof"
                          className="max-h-64 w-full cursor-pointer rounded-lg border border-green-200 bg-white object-contain"
                          onClick={() => window.open(donation.proofUrl!, "_blank")}
                        />
                      ) : (
                        <a href={donation.proofUrl} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 text-sm font-semibold text-green-700 hover:underline">
                          <FileText className="h-4 w-4" /> प्रमाण देखें (PDF) ↗
                        </a>
                      )}
                      <p className="mt-1.5 text-[11px] text-green-600">
                        छवि पर क्लिक करें → पूर्ण साइज़ में देखें
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 p-3 text-center">
                      <p className="text-xs text-stone-500">📷 दानदाता ने भुगतान प्रमाण अपलोड नहीं किया।</p>
                      <p className="mt-0.5 text-[11px] text-stone-400">WhatsApp/SMS पर स्क्रीनशॉट माँगें।</p>
                    </div>
                  )}

                  {/* ── 2. Receipt button ── */}
                  <a
                    href={`/receipt/${donation.receiptNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-saffron-400 bg-saffron-50 py-2.5 text-sm font-bold text-saffron-800 transition hover:bg-saffron-100"
                  >
                    <FileText className="h-4 w-4" />
                    पावती रसीद देखें / डाउनलोड
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  </a>

                  {/* ── 3. Read-only info ── */}
                  <div className="rounded-xl border border-stone-100 bg-stone-50 p-3 text-xs space-y-1.5 text-stone-600">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      <div><span className="font-semibold text-stone-400">रसीद:</span> {donation.receiptNumber}</div>
                      <div><span className="font-semibold text-stone-400">मोड:</span> {donation.mode}</div>
                      <div><span className="font-semibold text-stone-400">स्थिति:</span>
                        <span className={`ml-1 font-bold ${donation.status === "PAID" ? "text-blue-700" : "text-amber-700"}`}>
                          {donation.status === "PAID" ? "भुगतान प्राप्त" : "प्रतीक्षित"}
                        </span>
                      </div>
                      <div><span className="font-semibold text-stone-400">राशि:</span> {formatINR(donation.amount)}</div>
                      {donation.gatewayTxnId && (
                        <div className="col-span-2"><span className="font-semibold text-stone-400">TxnID:</span>{" "}
                          <span className="font-mono break-all">{donation.gatewayTxnId}</span>
                        </div>
                      )}
                      {donation.donor?.mobile && (
                        <div><span className="font-semibold text-stone-400">मोबाइल:</span> {donation.donor.mobile}</div>
                      )}
                      {donation.donor?.email && (
                        <div><span className="font-semibold text-stone-400">ईमेल:</span> {donation.donor.email}</div>
                      )}
                      {donation.campaign?.title && (
                        <div className="col-span-2"><span className="font-semibold text-stone-400">अभियान:</span> {donation.campaign.title}</div>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-stone-200" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">संपादन</span>
                    <div className="h-px flex-1 bg-stone-200" />
                  </div>

                  {/* ── 3. Editable fields ── */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-stone-600">दानदाता का नाम</label>
                    <input
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-stone-600">राशि (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400">₹</span>
                      <input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={`${inputCls} pl-7`}
                      />
                    </div>
                    {donation.amount !== parseInt(amount || "0", 10) && parseInt(amount || "0", 10) > 0 && (
                      <p className="mt-1 text-[11px] text-amber-700">
                        ⚠️ मूल राशि {formatINR(donation.amount)} → बदलकर {formatINR(parseInt(amount, 10))} होगी
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-stone-600">उद्देश्य</label>
                    <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className={inputCls}>
                      {PURPOSES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-stone-600">Admin नोट / संदेश</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={2}
                      className={inputCls}
                      placeholder="Admin की टिप्पणी..."
                    />
                  </div>

                  {/* Save */}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-stone-300 bg-stone-50 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    बदलाव सेव करें
                  </button>

                  {saved && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-center text-sm font-semibold text-green-700">
                      ✅ बदलाव सफलतापूर्वक सेव हो गए!
                    </div>
                  )}
                  {error && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
                  )}

                  {/* ── 4. Approve / Reject ── */}
                  <div className="rounded-xl border-2 border-stone-200 p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">अंतिम कार्रवाई</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleAction("approve")}
                        disabled={acting}
                        className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-60"
                      >
                        {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        ✅ स्वीकृत करें
                      </button>
                      <button
                        onClick={() => handleAction("reject")}
                        disabled={acting}
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                      >
                        {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                        ❌ अस्वीकृत करें
                      </button>
                    </div>
                    <p className="mt-2 text-center text-[11px] text-stone-400">
                      पहले बदलाव सेव करें, फिर स्वीकृत / अस्वीकृत करें
                    </p>
                  </div>

                  {/* ── Delete section ── */}
                  <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                    <p className="mb-2 text-xs font-bold text-red-700 uppercase tracking-wider">
                      ⚠️ गलत इंट्री हटाएँ
                    </p>
                    {donation.status === "SUCCESS" ? (
                      <p className="text-[11px] text-red-600">
                        सफल दान हटाया नहीं जा सकता। "अस्वीकृत करें" दबाने से VOID हो जाएगा।
                      </p>
                    ) : confirmDelete ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-red-800">
                          क्या आप सच में <strong>{donation.receiptNumber}</strong> ({formatINR(donation.amount)}) हटाना चाहते हैं?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            हाँ, हटाएँ
                          </button>
                          <button
                            onClick={() => setConfirmDelete(false)}
                            className="flex-1 rounded-xl border border-stone-300 bg-white py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                          >
                            रद्द करें
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-white py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> इस दान को हटाएँ (Delete)
                      </button>
                    )}
                  </div>

                </div>
              ) : (
                <p className="py-8 text-center text-sm text-red-600">{error || "दान लोड नहीं हो सका।"}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
