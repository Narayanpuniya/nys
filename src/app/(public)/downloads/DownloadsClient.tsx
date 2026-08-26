"use client";

import { useState } from "react";
import { CreditCard, Award, Receipt, Download, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const YEAR = new Date().getFullYear();
const MEMBER_PREFIX = `NYS-${YEAR}-`;
const RECEIPT_PREFIX = `DON-${YEAR}-`;

const inputCls =
  "flex-1 min-w-0 rounded-r-xl border border-l-0 border-stone-300 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 outline-none focus:border-saffron-400 focus:ring-2 focus:ring-saffron-100 transition";

const plainInputCls =
  "w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 outline-none focus:border-saffron-400 focus:ring-2 focus:ring-saffron-100 transition";

function PrefixInput({
  prefix, value, onChange, placeholder,
}: {
  prefix: string; value: string; onChange: (v: string) => void; placeholder?: string;
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

async function callVerify(body: Record<string, string>, errServer: string): Promise<{
  ok?: boolean; url?: string; name?: string; error?: string; remaining?: number;
}> {
  const res = await fetch("/api/downloads/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try { return text ? JSON.parse(text) : {}; } catch { return { error: errServer }; }
}

function DownloadCard({
  icon: Icon, title, subtitle, color, children,
}: {
  icon: React.ElementType; title: string; subtitle: string; color: string; children: React.ReactNode;
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

function IdCardDownload({ dict }: { dict: Record<string, string> }) {
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
      setError(dict.dl_err_required ?? "सदस्य कोड, मोबाइल नंबर और जन्म तारीख — तीनों आवश्यक हैं।");
      return;
    }
    setLoading(true);
    const code = `${MEMBER_PREFIX}${num.padStart(5, "0")}`;
    const data = await callVerify({ type: "idcard", code, mobile, dob }, dict.dl_err_server ?? "Invalid server response.");
    setLoading(false);
    if (data.ok && data.url) {
      setSuccess(`${dict.dl_success_prefix ?? "✅ Verified —"} ${data.name ?? ""}`);
      window.open(data.url, "_blank");
    } else {
      setError(data.error ?? (dict.dl_err_verify ?? "Verification failed."));
    }
  }

  const hintPre  = dict.dl_number_hint_pre  ?? "Enter numbers only —";
  const hintPost = dict.dl_number_hint_post ?? "will be added automatically.";

  return (
    <DownloadCard icon={CreditCard} title={dict.dl_idcard_title ?? "Member ID Card"} subtitle={dict.dl_idcard_sub ?? ""} color="bg-blue-600">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-stone-600">{dict.dl_member_code ?? "Member Code"} <span className="text-red-500">*</span></label>
          <PrefixInput prefix={MEMBER_PREFIX} value={num} onChange={setNum} />
          <p className="mt-1 text-[11px] text-stone-400">{hintPre} {MEMBER_PREFIX} {hintPost}</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-stone-600">{dict.dl_reg_mobile ?? "Registered Mobile"} <span className="text-red-500">*</span></label>
          <input value={mobile} onChange={e => setMobile(e.target.value)} placeholder={dict.dl_mobile_ph ?? "10-digit mobile number"} inputMode="tel" maxLength={15} className={plainInputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-stone-600">{dict.dl_dob_label ?? "Date of Birth"} <span className="text-red-500">*</span></label>
          <input type="date" value={dob} onChange={e => setDob(e.target.value)} className={plainInputCls} />
        </div>
        {error   && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        {success && <p className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">{success}</p>}
        <button type="submit" disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {dict.dl_view_idcard_btn ?? "View / Print ID Card"}
        </button>
      </form>
    </DownloadCard>
  );
}

function CertDownload({ dict }: { dict: Record<string, string> }) {
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
      setError(dict.dl_err_required ?? "Member code, mobile number and date of birth — all three are required.");
      return;
    }
    setLoading(true);
    const code = `${MEMBER_PREFIX}${num.padStart(5, "0")}`;
    const data = await callVerify({ type: "cert", code, mobile, dob }, dict.dl_err_server ?? "Invalid server response.");
    setLoading(false);
    if (data.ok && data.url) {
      setSuccess(`${dict.dl_success_prefix ?? "✅ Verified —"} ${data.name ?? ""}`);
      window.open(data.url, "_blank");
    } else {
      setError(data.error ?? (dict.dl_err_verify ?? "Verification failed."));
    }
  }

  const hintPre  = dict.dl_number_hint_pre  ?? "Enter numbers only —";
  const hintPost = dict.dl_number_hint_post ?? "will be added automatically.";

  return (
    <DownloadCard icon={Award} title={dict.dl_cert_title ?? "Membership Certificate"} subtitle={dict.dl_cert_sub ?? ""} color="bg-green-600">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-stone-600">{dict.dl_member_code ?? "Member Code"} <span className="text-red-500">*</span></label>
          <PrefixInput prefix={MEMBER_PREFIX} value={num} onChange={setNum} />
          <p className="mt-1 text-[11px] text-stone-400">{hintPre} {MEMBER_PREFIX} {hintPost}</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-stone-600">{dict.dl_reg_mobile ?? "Registered Mobile"} <span className="text-red-500">*</span></label>
          <input value={mobile} onChange={e => setMobile(e.target.value)} placeholder={dict.dl_mobile_ph ?? "10-digit mobile number"} inputMode="tel" maxLength={15} className={plainInputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-stone-600">{dict.dl_dob_label ?? "Date of Birth"} <span className="text-red-500">*</span></label>
          <input type="date" value={dob} onChange={e => setDob(e.target.value)} className={plainInputCls} />
        </div>
        {error   && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        {success && <p className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">{success}</p>}
        <button type="submit" disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {dict.dl_view_cert_btn ?? "View / Print Certificate"}
        </button>
      </form>
    </DownloadCard>
  );
}

function ReceiptDownload({ dict }: { dict: Record<string, string> }) {
  const [num, setNum]       = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!num.trim()) {
      setError(dict.dl_err_receipt_req ?? "Receipt number is required.");
      return;
    }
    setLoading(true);
    const receiptNumber = `${RECEIPT_PREFIX}${num.padStart(5, "0")}`;
    const data = await callVerify({ type: "receipt", receiptNumber, mobile }, dict.dl_err_server ?? "Invalid server response.");
    setLoading(false);
    if (data.ok && data.url) {
      setSuccess(`${dict.dl_success_prefix ?? "✅ Verified —"} ${data.name ?? ""}`);
      window.open(data.url, "_blank");
    } else {
      setError(data.error ?? (dict.dl_err_verify ?? "Verification failed."));
    }
  }

  const hintPre  = dict.dl_number_hint_pre  ?? "Enter numbers only —";
  const hintPost = dict.dl_number_hint_post ?? "will be added automatically.";

  return (
    <DownloadCard icon={Receipt} title={dict.dl_receipt_title ?? "Donation Receipt"} subtitle={dict.dl_receipt_sub ?? ""} color="bg-amber-600">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-stone-600">{dict.dl_receipt_no ?? "Receipt Number"} <span className="text-red-500">*</span></label>
          <PrefixInput prefix={RECEIPT_PREFIX} value={num} onChange={setNum} placeholder="00037" />
          <p className="mt-1 text-[11px] text-stone-400">{hintPre} {RECEIPT_PREFIX} {hintPost}</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-stone-600">
            {dict.dl_reg_mobile ?? "Registered Mobile"}{" "}
            <span className="font-normal text-stone-400">{dict.dl_mobile_optional_label ?? "(if provided)"}</span>
          </label>
          <input value={mobile} onChange={e => setMobile(e.target.value)} placeholder={dict.dl_mobile_ph ?? "10-digit mobile number"} inputMode="tel" maxLength={15} className={plainInputCls} />
        </div>
        {error   && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        {success && <p className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">{success}</p>}
        <button type="submit" disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {dict.dl_view_receipt_btn ?? "View / Print Receipt"}
        </button>
      </form>
    </DownloadCard>
  );
}

export function DownloadsClient({ dict }: { dict: Record<string, string> }) {
  const memberHintPre   = dict.dl_help_member_tip  ?? "For member code, enter only the last numbers —";
  const addedAuto       = dict.dl_help_added_auto  ?? "will be added automatically.";
  const receiptHintPre  = dict.dl_help_receipt_tip ?? "For receipt, enter only the last numbers —";
  const mobileTip       = dict.dl_help_mobile_tip  ?? "Enter the mobile number you provided when filling the form.";
  const contactHref     = dict.dl_help_contact     ?? "Contact us →";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "linear-gradient(135deg, #d97706, #7f1d1d)" }}>
          <Download className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-stone-800">{dict.dl_center_title ?? "Download Center"}</h1>
        <p className="mt-2 text-stone-500">{dict.dl_center_sub ?? "Securely verify to download your document."}</p>
      </div>

      {/* Security notice */}
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
        <div>
          <p className="font-semibold">{dict.dl_secure_title ?? "🔒 Secure Verification"}</p>
          <p className="mt-0.5 text-xs text-green-700">{dict.dl_secure_body ?? ""}</p>
        </div>
      </div>

      {/* 3 Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <IdCardDownload dict={dict} />
        <CertDownload dict={dict} />
        <ReceiptDownload dict={dict} />
      </div>

      {/* Help */}
      <div className="mt-8 rounded-2xl border border-stone-100 bg-stone-50 p-5">
        <p className="font-semibold text-stone-700 text-sm">{dict.dl_help_heading ?? "📌 Help"}</p>
        <ul className="mt-2 list-inside list-disc space-y-1.5 text-stone-500 text-xs">
          <li>{memberHintPre} <strong className="text-saffron-700">{MEMBER_PREFIX}</strong> {addedAuto}</li>
          <li>{receiptHintPre} <strong className="text-saffron-700">{RECEIPT_PREFIX}</strong> {addedAuto}</li>
          <li>{mobileTip}</li>
          <li>
            <a href="/contact" className="font-semibold text-saffron-700 hover:underline">{contactHref}</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
