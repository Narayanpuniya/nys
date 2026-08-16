"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, HandCoins } from "lucide-react";
import { Field, inputClass } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { formatINR, cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const PRESETS = [100, 500, 1000, 5000];

type Purpose = { key: string; label: string };

export function DonateForm({
  purposes,
  campaignId,
  campaignTitle,
}: {
  purposes: Purpose[];
  campaignId?: string;
  campaignTitle?: string;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState("");
  const [donorName, setDonorName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState(purposes[0]?.key ?? "GENERAL");
  const [message, setMessage] = useState("");
  const [anon, setAnon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const finalAmount = custom ? parseInt(custom, 10) || 0 : amount;

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
      let data: {
        error?: string;
        donationId?: string;
        orderId?: string;
        mock?: boolean;
        razorpayKey?: string | null;
      } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setError("सर्वर उत्तर अमान्य है। Redeploy / DATABASE_URL जाँचें।");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError(data.error || `दान विफल (${res.status})।`);
        setLoading(false);
        return;
      }
      if (!data.donationId || !data.orderId) {
        setError("दान शुरू नहीं हो सका। दोबारा प्रयास करें।");
        setLoading(false);
        return;
      }

      if (data.mock) {
        await confirm(data.donationId, data.orderId, `mock_pay_${Date.now()}`, `mock_sig_${data.orderId}`);
        return;
      }

      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) {
        setError("भुगतान गेटवे लोड नहीं हो सका।");
        setLoading(false);
        return;
      }
      const rzp = new window.Razorpay({
        key: data.razorpayKey,
        amount: finalAmount * 100,
        currency: "INR",
        name: "NYS — नारायणपुरी यूथ सोसाइटी",
        description: campaignTitle || "दान",
        order_id: data.orderId,
        prefill: { name: donorName, email, contact: mobile },
        theme: { color: "#ea6205" },
        handler: (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          confirm(data.donationId!, r.razorpay_order_id, r.razorpay_payment_id, r.razorpay_signature);
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch {
      setError("नेटवर्क त्रुटि। कनेक्शन जाँचकर दोबारा प्रयास करें।");
      setLoading(false);
    }
  }

  async function confirm(donationId: string, orderId: string, paymentId: string, signature: string) {
    try {
      const res = await fetch("/api/donations/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId, orderId, paymentId, signature }),
      });
      const text = await res.text();
      let data: { error?: string; receiptNumber?: string } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setError("सत्यापन उत्तर अमान्य।");
        setLoading(false);
        return;
      }
      if (res.ok && data.receiptNumber) {
        router.push(`/donate/success?receipt=${data.receiptNumber}`);
      } else {
        setError(data.error || "भुगतान सत्यापन विफल।");
        setLoading(false);
      }
    } catch {
      setError("सत्यापन नेटवर्क त्रुटि।");
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

      <div>
        <span className="mb-1 block text-sm font-medium text-ink">राशि चुनें</span>
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setAmount(p); setCustom(""); }}
              className={cn(
                "rounded-xl border px-2 py-2.5 text-sm font-semibold transition",
                !custom && amount === p
                  ? "border-saffron-500 bg-saffron-500 text-white"
                  : "border-stone-300 bg-white text-ink hover:border-saffron-300",
              )}
            >
              {formatINR(p)}
            </button>
          ))}
        </div>
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))}
          placeholder="अन्य राशि (₹)"
          inputMode="numeric"
          className={cn(inputClass, "mt-2")}
        />
      </div>

      {!campaignId && (
        <Field label="उद्देश्य">
          <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className={inputClass}>
            {purposes.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </Field>
      )}

      <label className="flex items-center gap-2 text-sm text-stone-600">
        <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
        मुझे गुमनाम दानदाता के रूप में रखें
      </label>

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

      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <Button onClick={handleDonate} disabled={loading} size="lg" className="w-full">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <HandCoins className="h-5 w-5" />}
        {formatINR(finalAmount)} का दान करें
      </Button>
      <p className="text-center text-xs text-stone-400">
        सुरक्षित भुगतान · भुगतान सफल होते ही रसीद स्वतः बन जाएगी
      </p>
    </div>
  );
}
