"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, HandCoins, CheckCircle2, Camera, Upload } from "lucide-react";
import { Field, inputClass } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { formatINR, cn } from "@/lib/utils";

const PRESETS = [100, 500, 1000, 5000];

type Purpose = { key: string; label: string };
type BankInfo = {
  accountName?: string; bankName?: string; accountNumber?: string;
  ifsc?: string; branch?: string; upiId?: string; upiQrUrl?: string;
};

export function DonateForm({
  purposes,
  campaignId,
  campaignTitle,
  bank,
}: {
  purposes: Purpose[];
  campaignId?: string;
  campaignTitle?: string;
  bank?: BankInfo;
}) {
  const router = useRouter();
  const [amount, setAmount]       = useState(500);
  const [custom, setCustom]       = useState("");
  const [donorName, setDonorName] = useState("");
  const [mobile, setMobile]       = useState("");
  const [email, setEmail]         = useState("");
  const [purpose, setPurpose]     = useState(purposes[0]?.key ?? "GENERAL");
  const [message, setMessage]     = useState("");
  const [anon, setAnon]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  // Payment proof screenshot
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const finalAmount = custom ? parseInt(custom, 10) || 0 : amount;

  // ── Dynamic UPI QR with amount pre-filled ───────────────────────────────────
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>("");
  const qrTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!bank?.upiId || !finalAmount) { setUpiQrDataUrl(""); return; }
    if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
    qrTimerRef.current = setTimeout(async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const upiLink = `upi://pay?pa=${encodeURIComponent(bank.upiId!)}&pn=${encodeURIComponent(bank.accountName ?? "NYS")}&am=${finalAmount}&cu=INR&tn=${encodeURIComponent("NYS दान")}`;
        const dataUrl = await QRCode.toDataURL(upiLink, {
          width: 220, margin: 1,
          color: { dark: "#1c1917", light: "#ffffff" },
        });
        setUpiQrDataUrl(dataUrl);
      } catch { /* fallback to static */ }
    }, 400);
    return () => { if (qrTimerRef.current) clearTimeout(qrTimerRef.current); };
  }, [finalAmount, bank?.upiId, bank?.accountName]);

  // ── Submit: create PENDING donation ────────────────────────────────────────
  async function handleDonate() {
    setError("");
    if (finalAmount < 10) return setError("न्यूनतम राशि ₹10 है।");
    if (!anon && donorName.trim().length < 2) return setError("कृपया अपना नाम दर्ज करें।");
    setLoading(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: anon ? "गुमनाम दानदाता" : donorName,
          mobile, email, amount: finalAmount, purpose, campaignId, message, isAnonymous: anon,
        }),
      });
      const text = await res.text();
      let data: { ok?: boolean; error?: string; receiptNumber?: string; donationId?: string; issues?: unknown } = {};
      try { data = text ? JSON.parse(text) : {}; } catch {
        setError("सर्वर उत्तर अमान्य है। बाद में प्रयास करें।");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError(data.error || `दान दर्ज नहीं हो सका (${res.status})।`);
        setLoading(false);
        return;
      }
      if (!data.receiptNumber) {
        setError("रसीद संख्या नहीं मिली। दोबारा प्रयास करें।");
        setLoading(false);
        return;
      }
      // Upload payment proof screenshot if provided
      if (proofFile && data.donationId) {
        try {
          const fd = new FormData();
          fd.append("donationId", data.donationId);
          fd.append("file", proofFile);
          await fetch("/api/donations/proof", { method: "POST", body: fd });
        } catch { /* non-fatal — donation already saved */ }
      }
      router.push(`/donate/success?receipt=${data.receiptNumber}`);
    } catch {
      setError("नेटवर्क त्रुटि। कनेक्शन जाँचकर दोबारा प्रयास करें।");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {campaignTitle && (
        <div className="rounded-xl bg-saffron-50 p-3 text-sm font-medium text-saffron-800">
          अभियान: {campaignTitle}
        </div>
      )}

      {/* Amount */}
      <div>
        <span className="mb-1 block text-sm font-medium text-ink">राशि चुनें</span>
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <button key={p} type="button" onClick={() => { setAmount(p); setCustom(""); }}
              className={cn(
                "rounded-xl border px-2 py-2.5 text-sm font-semibold transition",
                !custom && amount === p
                  ? "border-saffron-500 bg-saffron-500 text-white"
                  : "border-stone-300 bg-white text-ink hover:border-saffron-300",
              )}>
              {formatINR(p)}
            </button>
          ))}
        </div>
        <input value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))}
          placeholder="अन्य राशि (₹)" inputMode="numeric" className={cn(inputClass, "mt-2")} />
      </div>

      {/* Purpose */}
      {!campaignId && (
        <Field label="उद्देश्य">
          <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className={inputClass}>
            {purposes.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </Field>
      )}

      {/* Anonymous toggle */}
      <label className="flex items-center gap-2 text-sm text-stone-600">
        <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
        मुझे गुमनाम दानदाता के रूप में रखें
      </label>

      {/* Name */}
      {!anon && (
        <Field label="आपका नाम" required>
          <input value={donorName} onChange={(e) => setDonorName(e.target.value)} className={inputClass} />
        </Field>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="मोबाइल">
          <input value={mobile} onChange={(e) => setMobile(e.target.value)} className={inputClass} inputMode="tel" />
        </Field>
        <Field label="ईमेल">
          <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} inputMode="email" />
        </Field>
      </div>
      <Field label="संदेश (वैकल्पिक)">
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} className={inputClass} />
      </Field>

      {/* ── UPI / Bank payment section ───────────────────────────────────────── */}
      {(bank?.upiId || bank?.accountNumber) && (
        <div className="rounded-2xl border-2 border-saffron-300 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-800">
            💳 यहाँ {formatINR(finalAmount || 0)} भेजें
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            {/* Info */}
            <div className="flex-1 space-y-1.5 text-sm">
              {bank.upiId && (
                <div className="flex items-center gap-2">
                  <span className="w-14 shrink-0 text-[11px] font-semibold text-stone-500">UPI ID</span>
                  <span className="select-all rounded border border-saffron-200 bg-white px-2 py-0.5 font-mono text-sm font-bold text-saffron-800">{bank.upiId}</span>
                </div>
              )}
              {bank.accountName && (
                <div className="flex items-center gap-2">
                  <span className="w-14 shrink-0 text-[11px] font-semibold text-stone-500">नाम</span>
                  <span className="text-stone-700">{bank.accountName}</span>
                </div>
              )}
              {bank.bankName && (
                <div className="flex items-center gap-2">
                  <span className="w-14 shrink-0 text-[11px] font-semibold text-stone-500">बैंक</span>
                  <span className="text-stone-700">{bank.bankName}{bank.branch ? ` (${bank.branch})` : ""}</span>
                </div>
              )}
              {bank.accountNumber && (
                <div className="flex items-center gap-2">
                  <span className="w-14 shrink-0 text-[11px] font-semibold text-stone-500">खाता</span>
                  <span className="select-all rounded border border-stone-200 bg-white px-2 py-0.5 font-mono text-stone-700">{bank.accountNumber}</span>
                </div>
              )}
              {bank.ifsc && (
                <div className="flex items-center gap-2">
                  <span className="w-14 shrink-0 text-[11px] font-semibold text-stone-500">IFSC</span>
                  <span className="font-mono text-stone-700">{bank.ifsc}</span>
                </div>
              )}
            </div>
            {/* QR — dynamic with amount */}
            {(upiQrDataUrl || bank.upiQrUrl) && (
              <div className="flex shrink-0 flex-col items-center gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={upiQrDataUrl || bank.upiQrUrl!}
                  alt="UPI QR"
                  className="h-44 w-44 rounded-xl border-2 border-saffron-300 bg-white object-contain p-1 shadow-sm"
                />
                {upiQrDataUrl ? (
                  <span className="text-[11px] font-bold text-green-700">✅ {formatINR(finalAmount)} — स्कैन करें</span>
                ) : (
                  <span className="text-[11px] font-medium text-stone-500">QR स्कैन करें</span>
                )}
              </div>
            )}
          </div>
          {/* Instruction */}
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-white p-3 text-xs text-amber-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <span>
              ऊपर QR स्कैन करें या UPI ID पर <strong>{formatINR(finalAmount || 0)}</strong> भेजें।
              भुगतान के बाद स्क्रीनशॉट अपलोड करें और "दान दर्ज करें" बटन दबाएँ।
            </span>
          </div>

          {/* Payment proof upload */}
          <div className="mt-3">
            <p className="mb-1.5 text-xs font-bold text-amber-800">
              📸 भुगतान स्क्रीनशॉट / रसीद अपलोड करें
              <span className="ml-1 font-normal text-stone-500">(अनिवार्य नहीं, लेकिन जल्दी सत्यापन होगा)</span>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setProofFile(f);
                if (f) {
                  const reader = new FileReader();
                  reader.onload = (ev) => setProofPreview(ev.target?.result as string);
                  reader.readAsDataURL(f);
                } else {
                  setProofPreview("");
                }
              }}
            />
            {proofPreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={proofPreview} alt="payment proof" className="h-32 w-full rounded-xl border-2 border-green-300 object-contain bg-white" />
                <button
                  type="button"
                  onClick={() => { setProofFile(null); setProofPreview(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute right-1 top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white"
                >✕ हटाएँ</button>
                <p className="mt-1 text-[11px] font-semibold text-green-700">✅ {proofFile?.name}</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-white py-3 text-sm font-semibold text-amber-700 transition hover:border-amber-400 hover:bg-amber-50"
              >
                <Camera className="h-4 w-4" />
                <Upload className="h-4 w-4" />
                स्क्रीनशॉट / फोटो चुनें
              </button>
            )}
          </div>
        </div>
      )}

      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <Button onClick={handleDonate} disabled={loading} size="lg" className="w-full">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <HandCoins className="h-5 w-5" />}
        {formatINR(finalAmount)} — दान दर्ज करें
      </Button>
      <p className="text-center text-xs text-stone-400">
        भुगतान के बाद यह बटन दबाएँ · Admin सत्यापन के बाद रसीद जारी होगी
      </p>
    </div>
  );
}
