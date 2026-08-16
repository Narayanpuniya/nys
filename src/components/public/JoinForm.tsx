"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Field, inputClass } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { formatINR, cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay?: new (o: Record<string, unknown>) => { open: () => void };
  }
}

type Plan = { id: string; name: string; amount: number; description?: string | null };

const empty = {
  fullName: "", guardianName: "", dob: "", gender: "", mobile: "", whatsapp: "",
  email: "", address: "", village: "", district: "", state: "Rajasthan",
  occupation: "", bloodGroup: "", emergencyContact: "", photoUrl: "",
};

export function JoinForm({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(empty);
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function validateStep1(): boolean {
    if (form.fullName.trim().length < 2) { setError("कृपया पूरा नाम दर्ज करें।"); return false; }
    if (!/^(\+91[- ]?)?[6-9]\d{9}$/.test(form.mobile.trim())) { setError("मान्य मोबाइल नंबर दर्ज करें।"); return false; }
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

  async function submit() {
    if (!consent) { setError("कृपया सहमति दें।"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, planId, consent: true }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "पंजीकरण विफल।"); setLoading(false); return; }

      if (data.mock) {
        await confirm(data.memberId, data.orderId, `mock_pay_${Date.now()}`, `mock_sig_${data.orderId}`);
        return;
      }
      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) { setError("भुगतान गेटवे लोड नहीं हुआ।"); setLoading(false); return; }
      const rzp = new window.Razorpay({
        key: data.razorpayKey, amount: data.amount * 100, currency: "INR",
        name: "NYS सदस्यता", description: data.planName, order_id: data.orderId,
        prefill: { name: form.fullName, email: form.email, contact: form.mobile },
        theme: { color: "#ea6205" },
        handler: (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
          confirm(data.memberId, r.razorpay_order_id, r.razorpay_payment_id, r.razorpay_signature),
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch {
      setError("कुछ समस्या हुई है।"); setLoading(false);
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

  return (
    <div>
      {/* Stepper */}
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
          <Field label="मोबाइल" required><input className={inputClass} value={form.mobile} onChange={(e) => set("mobile", e.target.value)} inputMode="tel" /></Field>
          <Field label="WhatsApp"><input className={inputClass} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} inputMode="tel" /></Field>
          <Field label="ईमेल"><input className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} inputMode="email" /></Field>
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
          <label className="flex items-start gap-2 text-sm text-stone-600">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
            मैं अपनी जानकारी NYS को स्वेच्छा से प्रदान कर रहा/रही हूँ और सदस्यता नियमों से सहमत हूँ।
          </label>
        </div>
      )}

      {/* Nav */}
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
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} भुगतान करें व सदस्य बनें
          </Button>
        )}
      </div>
    </div>
  );
}
