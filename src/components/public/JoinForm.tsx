"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ArrowLeft, Check, Upload, Eye, EyeOff } from "lucide-react";
import { Field, inputClass } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { formatINR, cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay?: new (o: Record<string, unknown>) => { open: () => void };
  }
}

type Plan = { id: string; name: string; amount: number; description?: string | null };

type BankInfo = {
  accountName?: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  branch?: string;
  upiId?: string;
};

const empty = {
  fullName: "", guardianName: "", dob: "", gender: "", mobile: "", whatsapp: "",
  email: "", address: "", village: "", district: "", state: "Rajasthan",
  occupation: "", bloodGroup: "", emergencyContact: "", photoUrl: "",
  password: "", confirmPassword: "",
};

export function JoinForm({ plans, bank }: { plans: Plan[]; bank?: BankInfo }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(empty);
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [consent, setConsent] = useState(false);
  const [payMethod, setPayMethod] = useState<"online" | "receipt">("receipt");
  const [proof, setProof] = useState<File | null>(null);
  const [txnNote, setTxnNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function validateStep1(): boolean {
    if (form.fullName.trim().length < 2) { setError("कृपया पूरा नाम दर्ज करें।"); return false; }
    if (!/^(\+91[- ]?)?[6-9]\d{9}$/.test(form.mobile.trim())) { setError("मान्य मोबाइल नंबर दर्ज करें।"); return false; }
    if (form.password.length < 6) { setError("पासवर्ड कम से कम 6 अक्षर का होना चाहिए।"); return false; }
    if (form.password !== form.confirmPassword) { setError("दोनों पासवर्ड मेल नहीं खाते।"); return false; }
    setError("");
    return true;
  }

  async function loadRazorpay(): Promise<boolean> {
    if (window.Razorpay) return true;
    return new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });
  }

  async function submitOnline() {
    const { confirmPassword: _cp, ...formData } = form; // confirmPassword exclude करें
    const res = await fetch("/api/members", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, planId, consent: true }),
    });
    const text = await res.text();
    let data: {
      error?: string;
      memberId?: string;
      orderId?: string;
      planName?: string;
      amount?: number;
      mock?: boolean;
      razorpayKey?: string | null;
    } = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      setError("सर्वर उत्तर अमान्य है। Hostinger DATABASE_URL / Redeploy जाँचें।");
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setError(data.error || `पंजीकरण विफल (${res.status})।`);
      setLoading(false);
      return;
    }
    if (!data.memberId || !data.orderId) {
      setError("पंजीकरण अधूरा रहा। दोबारा प्रयास करें।");
      setLoading(false);
      return;
    }

    if (data.mock) {
      await confirm(data.memberId, data.orderId, `mock_pay_${Date.now()}`, `mock_sig_${data.orderId}`);
      return;
    }
    const ok = await loadRazorpay();
    if (!ok || !window.Razorpay) { setError("भुगतान गेटवे लोड नहीं हुआ।"); setLoading(false); return; }
    const rzp = new window.Razorpay({
      key: data.razorpayKey, amount: (data.amount ?? 0) * 100, currency: "INR",
      name: "NYS सदस्यता", description: data.planName, order_id: data.orderId,
      prefill: { name: form.fullName, email: form.email, contact: form.mobile },
      theme: { color: "#ea6205" },
      handler: (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
        confirm(data.memberId!, r.razorpay_order_id, r.razorpay_payment_id, r.razorpay_signature),
      modal: { ondismiss: () => setLoading(false) },
    });
    rzp.open();
  }

  async function submitReceipt() {
    if (!proof) {
      setError("कृपया भुगतान रसीद / स्क्रीनशॉट अपलोड करें।");
      setLoading(false);
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k !== "confirmPassword") fd.set(k, v); // confirmPassword server पर नहीं चाहिए
    });
    fd.set("planId", planId);
    fd.set("consent", "true");
    fd.set("mode", bank?.upiId ? "UPI" : "BANK_TRANSFER");
    if (txnNote.trim()) fd.set("notes", txnNote.trim());
    fd.set("proof", proof);

    const res = await fetch("/api/members/offline", { method: "POST", body: fd });
    const text = await res.text();
    let data: { error?: string; memberCode?: string; status?: string } = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      setError("सर्वर उत्तर अमान्य है।");
      setLoading(false);
      return;
    }
    if (!res.ok || !data.memberCode) {
      setError(data.error || "आवेदन विफल।");
      setLoading(false);
      return;
    }
    router.push(`/join/success?code=${data.memberCode}&status=${data.status || "PENDING"}&mode=receipt`);
  }

  async function submit() {
    if (!consent) { setError("कृपया सहमति दें।"); return; }
    setError(""); setLoading(true);
    try {
      if (payMethod === "receipt") await submitReceipt();
      else await submitOnline();
    } catch {
      setError("नेटवर्क/सर्वर त्रुटि। कनेक्शन जाँचकर दोबारा प्रयास करें।");
      setLoading(false);
    }
  }

  async function confirm(memberId: string, orderId: string, paymentId: string, signature: string) {
    const res = await fetch("/api/members/verify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, orderId, paymentId, signature }),
    });
    const data = await res.json();
    if (res.ok && data.memberCode) {
      router.push(`/join/success?code=${data.memberCode}&status=${data.status}`);
    } else {
      setError(data.error || "भुगतान सत्यापन विफल।"); setLoading(false);
    }
  }

  const selectedPlan = plans.find((p) => p.id === planId);
  const hasBank = !!(bank?.upiId || bank?.accountNumber);

  return (
    <div>
      <div className="mb-6 flex items-center justify-center gap-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <span className={cn("flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
              step >= n ? "bg-saffron-600 text-white" : "bg-stone-200 text-stone-500")}>
              {step > n ? <Check className="h-4 w-4" /> : n}
            </span>
            {n < 3 && <span className={cn("h-0.5 w-10", step > n ? "bg-saffron-500" : "bg-stone-200")} />}
          </div>
        ))}
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      {step === 1 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="पूरा नाम" required><input className={inputClass} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} /></Field>
          <Field label="पिता/पति का नाम"><input className={inputClass} value={form.guardianName} onChange={(e) => set("guardianName", e.target.value)} /></Field>
          <div className="flex flex-col gap-1">
            <Field label="मोबाइल" required>
              <input
                className={inputClass}
                value={form.mobile}
                onChange={(e) => set("mobile", e.target.value)}
                inputMode="tel"
                type="tel"
                autoComplete="tel"
                placeholder="9876543210"
              />
            </Field>
            <p className="text-xs text-stone-400">📱 लॉगिन के लिए मुख्य नंबर</p>
          </div>
          <Field label="WhatsApp"><input className={inputClass} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} inputMode="tel" /></Field>
          <div className="flex flex-col gap-1">
            <Field label="ईमेल (लॉगिन के लिए)">
              <input
                className={inputClass}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="abc@gmail.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </Field>
            <p className="text-xs text-saffron-700">📧 मोबाइल या ईमेल — दोनों से लॉगिन कर सकते हैं</p>
          </div>
          <Field label="जन्म तिथि"><input className={inputClass} type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} /></Field>
          <Field label="लिंग">
            <select className={inputClass} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="">चुनें</option><option>पुरुष</option><option>महिला</option><option>अन्य</option>
            </select>
          </Field>
          <Field label="व्यवसाय"><input className={inputClass} value={form.occupation} onChange={(e) => set("occupation", e.target.value)} /></Field>
          <Field label="गाँव/शहर"><input className={inputClass} value={form.village} onChange={(e) => set("village", e.target.value)} /></Field>
          <Field label="जिला"><input className={inputClass} value={form.district} onChange={(e) => set("district", e.target.value)} /></Field>
          <div className="sm:col-span-2">
            <Field label="पता"><textarea className={inputClass} rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
          </div>

          {/* ── पासवर्ड सेट करें ── */}
          <div className="sm:col-span-2">
            <div className="rounded-xl border border-saffron-200 bg-saffron-50 p-4">
              <p className="mb-3 text-sm font-semibold text-saffron-800">🔐 लॉगिन पासवर्ड सेट करें</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="पासवर्ड" required>
                  <div className="relative">
                    <input
                      className={inputClass + " pr-10"}
                      type={showPass ? "text" : "password"}
                      placeholder="कम से कम 6 अक्षर"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      tabIndex={-1}
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>
                <Field label="पासवर्ड दोबारा लिखें" required>
                  <div className="relative">
                    <input
                      className={inputClass + " pr-10"}
                      type={showConfirm ? "text" : "password"}
                      placeholder="पासवर्ड फिर से दर्ज करें"
                      value={form.confirmPassword}
                      onChange={(e) => set("confirmPassword", e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>
              </div>
              <p className="mt-2 text-xs text-stone-500">
                यह पासवर्ड बाद में{" "}
                <span className="font-medium text-saffron-700">nys.org.in/login</span>{" "}
                पर मोबाइल नंबर के साथ काम करेगा।
              </p>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-ink">सदस्यता योजना चुनें</p>
          {plans.map((p) => (
            <button key={p.id} type="button" onClick={() => setPlanId(p.id)}
              className={cn("flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition",
                planId === p.id ? "border-saffron-500 bg-saffron-50" : "border-stone-200 bg-white hover:border-saffron-300")}>
              <div>
                <div className="font-semibold text-ink">{p.name}</div>
                {p.description && <div className="text-xs text-stone-500">{p.description}</div>}
              </div>
              <div className="text-xl font-extrabold text-saffron-800">{formatINR(p.amount)}</div>
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-xl bg-saffron-50 p-4">
            <h3 className="font-semibold text-ink">सारांश</h3>
            <div className="mt-2 space-y-1 text-sm text-stone-600">
              <div className="flex justify-between"><span>नाम</span><span className="font-medium">{form.fullName}</span></div>
              <div className="flex justify-between"><span>मोबाइल</span><span className="font-medium">{form.mobile}</span></div>
              <div className="flex justify-between"><span>योजना</span><span className="font-medium">{selectedPlan?.name}</span></div>
              <div className="flex justify-between"><span>राशि</span><span className="font-bold text-saffron-800">{formatINR(selectedPlan?.amount ?? 0)}</span></div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-ink">भुगतान का तरीका</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPayMethod("receipt")}
                className={cn(
                  "rounded-xl border-2 p-3 text-left text-sm transition",
                  payMethod === "receipt" ? "border-saffron-500 bg-saffron-50" : "border-stone-200 bg-white",
                )}
              >
                <div className="font-semibold text-ink">UPI / बैंक + रसीद अपलोड</div>
                <div className="mt-0.5 text-xs text-stone-500">भुगतान करके स्क्रीनशॉट भेजें — एडमिन जाँच करेगा</div>
              </button>
              <button
                type="button"
                onClick={() => setPayMethod("online")}
                className={cn(
                  "rounded-xl border-2 p-3 text-left text-sm transition",
                  payMethod === "online" ? "border-saffron-500 bg-saffron-50" : "border-stone-200 bg-white",
                )}
              >
                <div className="font-semibold text-ink">ऑनलाइन भुगतान</div>
                <div className="mt-0.5 text-xs text-stone-500">Razorpay / कार्ड / UPI गेटवे</div>
              </button>
            </div>
          </div>

          {payMethod === "receipt" && (
            <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
              {hasBank ? (
                <div className="rounded-lg bg-stone-50 p-3 text-sm text-stone-700">
                  <p className="font-semibold text-ink">भुगतान यहाँ करें</p>
                  {bank?.upiId && <p className="mt-1">UPI: <span className="font-mono font-medium">{bank.upiId}</span></p>}
                  {bank?.accountName && <p>खाता नाम: {bank.accountName}</p>}
                  {bank?.bankName && <p>बैंक: {bank.bankName}{bank.branch ? ` (${bank.branch})` : ""}</p>}
                  {bank?.accountNumber && <p>खाता नं.: <span className="font-mono">{bank.accountNumber}</span></p>}
                  {bank?.ifsc && <p>IFSC: <span className="font-mono">{bank.ifsc}</span></p>}
                  <p className="mt-2 text-xs text-stone-500">
                    राशि {formatINR(selectedPlan?.amount ?? 0)} ट्रांसफर करें, फिर नीचे रसीद अपलोड करें।
                  </p>
                </div>
              ) : (
                <p className="text-sm text-amber-800 bg-amber-50 rounded-lg p-3">
                  बैंक/UPI विवरण Admin → Settings में जोड़ें। फिर भी आप रसीद अपलोड कर आवेदन भेज सकते हैं।
                </p>
              )}

              <Field label="भुगतान रसीद / स्क्रीनशॉट" required>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-600 hover:border-saffron-400">
                  <Upload className="h-6 w-6 text-saffron-600" />
                  <span>{proof ? proof.name : "JPG / PNG / PDF चुनें (अधिकतम 2 MB)"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                    className="hidden"
                    onChange={(e) => setProof(e.target.files?.[0] ?? null)}
                  />
                </label>
              </Field>
              <Field label="UPI / लेनदेन नोट (वैकल्पिक)">
                <input
                  className={inputClass}
                  value={txnNote}
                  onChange={(e) => setTxnNote(e.target.value)}
                  placeholder="जैसे UTR नंबर या नोट"
                />
              </Field>
            </div>
          )}

          <label className="flex items-start gap-2 text-sm text-stone-600">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
            मैं अपनी जानकारी NYS को स्वेच्छा से प्रदान कर रहा/रही हूँ और सदस्यता नियमों से सहमत हूँ।
          </label>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}><ArrowLeft className="h-4 w-4" /> पीछे</Button>
        ) : <span />}
        {step < 3 ? (
          <Button onClick={() => { if (step === 1 && !validateStep1()) return; setStep((s) => s + 1); }}>
            आगे <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={submit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {payMethod === "receipt" ? "रसीद भेजकर आवेदन करें" : "भुगतान करें व सदस्य बनें"}
          </Button>
        )}
      </div>
    </div>
  );
}
