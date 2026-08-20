"use client";

import { useState } from "react";
import { CreditCard, Award, Receipt, Download, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Current year for prefix ───────────────────────────────────────────────────
const YEAR = new Date().getFullYear();
const MEMBER_PREFIX = `NYS-${YEAR}-`;
const RECEIPT_PREFIX = `DON-${YEAR}-`;

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputCls =
  "flex-1 min-w-0 rounded-r-xl border border-l-0 border-stone-300 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 outline-none focus:border-saffron-400 focus:ring-2 focus:ring-saffron-100 transition";

const plainInputCls =
  "w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 outline-none focus:border-saffron-400 focus:ring-2 focus:ring-saffron-100 transition";

// ── Prefix input component ────────────────────────────────────────────────────
function PrefixInput({
  prefix,
  value,
  onChange,
  placeholder,
}: {
  prefix: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex overflow-hidden rounded-xl border border-stone-300 focus-within:border-saffron-400 focus-within:ring-2 focus-within:ring-saffron-100 transition">
      <span className="flex items-center rounded-l-xl border-r border-stone-300 bg-saffron-50 px-3 py-2.5 text-sm font-bold text-saffron-800 select-none whitespace-nowrap">
        {prefix}
      </span>
      <input
        value={value}
        onChange={e => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder={placeholder ?? "00001"}
        inputMode="numeric"
        maxLength={10}
        className="flex-1 min-w-0 rounded-r-xl bg-stone-50 px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 outline-none"
      />
    </div>
  );
}

// ── Verify API call ───────────────────────────────────────────────────────────
async function callVerify(body: Record<string, string>): Promise<{
  ok?: boolean; url?: string; name?: string; error?: string; remaining?: number;
}> {
  const res = await fetch("/api/downloads/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try { return text ? JSON.parse(text) : {}; } catch { return { error: "सर्वर उत्तर अमान्य है।" }; }
}

// ── Single download card ──────────────────────────────────────────────────────
function DownloadCard({
  icon: Icon,
  title,
  subtitle,
  color,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className={cn("mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl", color)}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h2 className="text-lg font-bold text-stone-800">{title}</h2>
      <p className="mb-4 mt-1 text-sm text-stone-500">{subtitle}</p>
      {children}
    </div>
  );
}

// ── ID Card ───────────────────────────────────────────────────────────────────
function IdCardDownload() {
  const [num, setNum]       = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!num.trim() || !mobile.trim() || !dob.trim()) {
      setError("सदस्य कोड, मोबाइल नंबर और जन्म तारीख — तीनों आवश्यक हैं।");
      return;
    }
    setLoading(true);
    const code = `${MEMBER_PREFIX}${num.padStart(5, "0")}`;
    const data = await callVerify({ type: "idcard", code, mobile, dob });
    setLoading(false);
    if (data.ok && data.url) {
      setSuccess(`✅ सत्यापन सफल — ${data.name ?? ""}`);
      window.open(data.url, "_blank");
    } else {
      setError(data.error ?? "सत्यापन विफल।");
    }
  }

  return (
    <DownloadCard icon={CreditCard} title="सदस्य ID कार्ड" subtitle="डिजिटल पहचान पत्र डाउनलोड / प्रिंट करें।" color="bg-blue-600">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-stone-600">सदस्य कोड <span className="text-red-500">*</span></label>
          <PrefixInput prefix={MEMBER_PREFIX} value={num} onChange={setNum} placeholder="00001" />
          <p className="mt-1 text-[11px] text-stone-400">सिर्फ नंबर डालें — {MEMBER_PREFIX} अपने आप लगेगा।</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-stone-600">पंजीकृत मोबाइल <span className="text-red-500">*</span></label>
          <input value={mobile} onChange={e => setMobile(e.target.value)} placeholder="10 अंकों का मोबाइल नंबर" inputMode="tel" maxLength={15} className={plainInputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-stone-600">जन्म तारीख <span className="text-red-500">*</span></label>
          <input type="date" value={dob} onChange={e => setDob(e.target.value)} className={plainInputCls} />
        </div>
        {error   && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        {success && <p className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">{success}</p>}
        <button type="submit" disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          ID कार्ड देखें / प्रिंट करें
        </button>
      </form>
    </DownloadCard>
  );
}

// ── Certificate ───────────────────────────────────────────────────────────────
function CertDownload() {
  const [num, setNum]       = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!num.trim() || !mobile.trim() || !dob.trim()) {
      setError("सदस्य कोड, मोबाइल नंबर और जन्म तारीख — तीनों आवश्यक हैं।");
      return;
    }
    setLoading(true);
    const code = `${MEMBER_PREFIX}${num.padStart(5, "0")}`;
    const data = await callVerify({ type: "cert", code, mobile, dob });
    setLoading(false);
    if (data.ok && data.url) {
      setSuccess(`✅ सत्यापन सफल — ${data.name ?? ""}`);
      window.open(data.url, "_blank");
    } else {
      setError(data.error ?? "सत्यापन विफल।");
    }
  }

  return (
    <DownloadCard icon={Award} title="सदस्यता प्रमाण पत्र" subtitle="ऑफिशियल सदस्यता प्रमाण पत्र डाउनलोड करें।" color="bg-green-600">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-stone-600">सदस्य कोड <span className="text-red-500">*</span></label>
          <PrefixInput prefix={MEMBER_PREFIX} value={num} onChange={setNum} placeholder="00001" />
          <p className="mt-1 text-[11px] text-stone-400">सिर्फ नंबर डालें — {MEMBER_PREFIX} अपने आप लगेगा।</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-stone-600">पंजीकृत मोबाइल <span className="text-red-500">*</span></label>
          <input value={mobile} onChange={e => setMobile(e.target.value)} placeholder="10 अंकों का मोबाइल नंबर" inputMode="tel" maxLength={15} className={plainInputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-stone-600">जन्म तारीख <span className="text-red-500">*</span></label>
          <input type="date" value={dob} onChange={e => setDob(e.target.value)} className={plainInputCls} />
        </div>
        {error   && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        {success && <p className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">{success}</p>}
        <button type="submit" disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          प्रमाण पत्र देखें / प्रिंट करें
        </button>
      </form>
    </DownloadCard>
  );
}

// ── Donation Receipt ──────────────────────────────────────────────────────────
function ReceiptDownload() {
  const [num, setNum]       = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!num.trim()) { setError("रसीद संख्या आवश्यक है।"); return; }
    setLoading(true);
    const receiptNumber = `${RECEIPT_PREFIX}${num.padStart(5, "0")}`;
    const data = await callVerify({ type: "receipt", receiptNumber, mobile });
    setLoading(false);
    if (data.ok && data.url) {
      setSuccess(`✅ सत्यापन सफल — ${data.name ?? ""}`);
      window.open(data.url, "_blank");
    } else {
      setError(data.error ?? "सत्यापन विफल।");
    }
  }

  return (
    <DownloadCard icon={Receipt} title="दान रसीद" subtitle="अपनी दान पावती या रसीद डाउनलोड करें।" color="bg-amber-600">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-stone-600">रसीद संख्या <span className="text-red-500">*</span></label>
          <PrefixInput prefix={RECEIPT_PREFIX} value={num} onChange={setNum} placeholder="00037" />
          <p className="mt-1 text-[11px] text-stone-400">सिर्फ नंबर डालें — {RECEIPT_PREFIX} अपने आप लगेगा।</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-stone-600">पंजीकृत मोबाइल <span className="text-stone-400 font-normal">(यदि दिया था)</span></label>
          <input value={mobile} onChange={e => setMobile(e.target.value)} placeholder="10 अंकों का मोबाइल नंबर" inputMode="tel" maxLength={15} className={plainInputCls} />
        </div>
        {error   && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        {success && <p className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">{success}</p>}
        <button type="submit" disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          रसीद देखें / प्रिंट करें
        </button>
      </form>
    </DownloadCard>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DownloadsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "linear-gradient(135deg, #d97706, #7f1d1d)" }}>
          <Download className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-stone-800">डाउनलोड केंद्र</h1>
        <p className="mt-2 text-stone-500">सुरक्षित सत्यापन के बाद अपना दस्तावेज़ डाउनलोड करें।</p>
      </div>

      {/* Security notice */}
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
        <div>
          <p className="font-semibold">🔒 सुरक्षित सत्यापन</p>
          <p className="mt-0.5 text-xs text-green-700">
            आपका डेटा सुरक्षित है। दस्तावेज़ केवल पंजीकृत मोबाइल व जन्म तारीख मिलने पर ही डाउनलोड होगा।
            5 गलत प्रयास के बाद 15 मिनट के लिए अवरुद्ध।
          </p>
        </div>
      </div>

      {/* 3 Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <IdCardDownload />
        <CertDownload />
        <ReceiptDownload />
      </div>

      {/* Help */}
      <div className="mt-8 rounded-2xl border border-stone-100 bg-stone-50 p-5">
        <p className="font-semibold text-stone-700 text-sm">📌 सहायता</p>
        <ul className="mt-2 list-inside list-disc space-y-1.5 text-stone-500 text-xs">
          <li>सदस्य कोड में <strong>सिर्फ अंत के नंबर</strong> डालें — <strong className="text-saffron-700">{MEMBER_PREFIX}</strong> अपने आप जुड़ जाएगा।</li>
          <li>रसीद में भी <strong>सिर्फ अंत के नंबर</strong> डालें — <strong className="text-saffron-700">{RECEIPT_PREFIX}</strong> अपने आप जुड़ेगा।</li>
          <li>मोबाइल नंबर वही डालें जो <strong>फॉर्म भरते समय</strong> दिया था।</li>
          <li>कोई समस्या हो तो{" "}
            <a href="/contact" className="font-semibold text-saffron-700 hover:underline">संपर्क करें →</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
