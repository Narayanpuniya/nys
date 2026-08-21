"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ArrowLeft, Check, Upload, Eye, EyeOff } from "lucide-react";
import { Field, inputClass } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { formatINR, cn } from "@/lib/utils";
import { ImageCropper } from "@/components/ui/ImageCropper";

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
  upiQrUrl?: string;
};

const empty = {
  fullName: "", guardianName: "", dob: "", gender: "", mobile: "", whatsapp: "",
  email: "", address: "", village: "", tehsil: "", district: "", state: "Rajasthan",
  occupation: "", bloodGroup: "", emergencyContact: "", photoUrl: "",
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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [wantVolunteer, setWantVolunteer] = useState(false);
  const [volunteerAreas, setVolunteerAreas] = useState<string[]>([]);

  const VOLUNTEER_AREAS = ["शिक्षा", "खेल", "पर्यावरण", "सामाजिक सेवा", "कार्यक्रम आयोजन", "आईटी/तकनीक", "अन्य"];

  function toggleArea(area: string) {
    setVolunteerAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function validateStep1(): boolean {
    if (form.fullName.trim().length < 2) { setError("कृपया पूरा नाम दर्ज करें।"); return false; }
    if (!/^(\+91[- ]?)?[6-9]\d{9}$/.test(form.mobile.trim())) { setError("मान्य मोबाइल नंबर दर्ज करें।"); return false; }
    if (!form.dob) { setError("जन्म तिथि अनिवार्य है।"); return false; }
    if (!form.gender) { setError("लिंग चुनना अनिवार्य है।"); return false; }
    if (!form.district.trim()) { setError("जिला अनिवार्य है।"); return false; }
    if (!form.tehsil.trim()) { setError("तहसील अनिवार्य है।"); return false; }
    if (!form.state.trim()) { setError("राज्य अनिवार्य है।"); return false; }
    if (!photoFile && !form.photoUrl) { setError("प्रोफाइल फ़ोटो अनिवार्य है।"); return false; }
    if (wantVolunteer && volunteerAreas.length === 0) { setError("स्वयंसेवक के लिए कम से कम एक क्षेत्र चुनें।"); return false; }
    if (password.length < 6) { setError("पासवर्ड कम से कम 6 अक्षर का होना चाहिए।"); return false; }
    if (password !== confirmPassword) { setError("पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।"); return false; }
    setError("");
    return true;
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    // Show cropper instead of setting directly
    const reader = new FileReader();
    reader.onload = (ev) => setCropSrc(ev.target?.result as string);
    reader.readAsDataURL(f);
    // Reset input so same file can be re-picked after cancel
    e.target.value = "";
  }

  function handleCropDone(file: File, url: string) {
    setPhotoFile(file);
    setPhotoPreview(url);
    setCropSrc(null);
  }

  async function uploadPhotoAndAdvance() {
    if (!validateStep1()) return;
    setLoading(true);
    setError("");
    try {
      // ── Step 1: मोबाइल नंबर duplicate check ──
      const chkRes = await fetch(`/api/members/check-mobile?mobile=${encodeURIComponent(form.mobile.trim())}`);
      const chk = await chkRes.json().catch(() => ({}));
      if (chk.exists) {
        setError("यह मोबाइल नंबर पहले से पंजीकृत है। Admin से संपर्क करें या अपनी पुरानी सदस्यता देखें।");
        setLoading(false);
        return;
      }

      // ── Step 2: फ़ोटो अपलोड ──
      if (photoFile) {
        const fd = new FormData();
        fd.set("photo", photoFile);
        const res = await fetch("/api/members/photo", { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.url) {
          setError(data.error ?? "फ़ोटो अपलोड विफल। दोबारा प्रयास करें।");
          setLoading(false);
          return;
        }
        set("photoUrl", data.url);
      }
      setStep((s) => s + 1);
    } catch {
      setError("नेटवर्क त्रुटि। कनेक्शन जाँचें।");
    } finally {
      setLoading(false);
    }
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
    const res = await fetch("/api/members", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, planId, consent: true, password, wantVolunteer, volunteerAreas }),
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
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    fd.set("planId", planId);
    fd.set("consent", "true");
    fd.set("password", password);
    fd.set("mode", bank?.upiId ? "UPI" : "BANK_TRANSFER");
    if (txnNote.trim()) fd.set("notes", txnNote.trim());
    fd.set("proof", proof);
    fd.set("wantVolunteer", wantVolunteer ? "true" : "false");
    fd.set("volunteerAreas", JSON.stringify(volunteerAreas));

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

  // ── Dynamic UPI QR with plan amount pre-filled ──────────────────────────
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>("");
  const qrTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const amount = selectedPlan?.amount;
    if (!bank?.upiId || !amount) { setUpiQrDataUrl(""); return; }
    if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
    qrTimerRef.current = setTimeout(async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const upiLink = `upi://pay?pa=${encodeURIComponent(bank.upiId!)}&pn=${encodeURIComponent(bank.accountName ?? "NYS")}&am=${amount}&cu=INR&tn=${encodeURIComponent("NYS सदस्यता")}`;
        const dataUrl = await QRCode.toDataURL(upiLink, { width: 220, margin: 1, color: { dark: "#1c1917", light: "#ffffff" } });
        setUpiQrDataUrl(dataUrl);
      } catch { /* fallback to static */ }
    }, 300);
    return () => { if (qrTimerRef.current) clearTimeout(qrTimerRef.current); };
  }, [selectedPlan?.amount, bank?.upiId, bank?.accountName]);

  return (
    <div>
      {/* ── Image Cropper Modal ── */}
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          onDone={handleCropDone}
          onCancel={() => setCropSrc(null)}
        />
      )}

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
          {/* ── प्रोफाइल फ़ोटो ── */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-ink">प्रोफाइल फ़ोटो <span className="text-red-500">*</span></label>
            <label className="flex cursor-pointer items-center gap-4">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="preview" className="h-20 w-20 rounded-full border-2 border-saffron-300 object-cover shadow" />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-stone-300 bg-stone-50 text-3xl">
                  📷
                </div>
              )}
              <div className="flex-1">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-saffron-300 bg-saffron-50 px-3 py-1.5 text-sm font-medium text-saffron-800 hover:bg-saffron-100">
                  <Upload className="h-4 w-4" /> फ़ोटो चुनें
                </span>
                <p className="mt-1 text-xs text-stone-400">JPG / PNG · अधिकतम 3 MB · पासपोर्ट साइज़</p>
              </div>
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>

          <Field label="पूरा नाम" required><input className={inputClass} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} /></Field>
          <Field label="पिता/पति का नाम"><input className={inputClass} value={form.guardianName} onChange={(e) => set("guardianName", e.target.value)} /></Field>
          <div>
            <Field label="मोबाइल" required>
              <input className={inputClass} value={form.mobile} onChange={(e) => set("mobile", e.target.value)} inputMode="tel" />
            </Field>
            <p className="mt-1 text-xs text-saffron-700 font-medium">📱 यही नंबर लॉगिन में काम आएगा</p>
          </div>
          <Field label="WhatsApp"><input className={inputClass} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} inputMode="tel" /></Field>
          <div>
            <Field label="ईमेल">
              <input className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} inputMode="email" type="email" placeholder="name@example.com" />
            </Field>
            <p className="mt-1 text-xs text-saffron-700 font-medium">📧 ईमेल से भी लॉगिन कर सकते हैं (वैकल्पिक)</p>
          </div>
          <Field label="जन्म तिथि" required><input className={inputClass} type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} /></Field>
          <Field label="लिंग" required>
            <select className={inputClass} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="">— चुनें —</option>
              <option value="पुरुष">पुरुष</option>
              <option value="महिला">महिला</option>
              <option value="अन्य">अन्य</option>
            </select>
          </Field>
          <Field label="व्यवसाय"><input className={inputClass} value={form.occupation} onChange={(e) => set("occupation", e.target.value)} /></Field>
          <Field label="ब्लड ग्रुप">
            <select className={inputClass} value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)}>
              <option value="">— चुनें —</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </Field>
          <Field label="गाँव/शहर"><input className={inputClass} value={form.village} onChange={(e) => set("village", e.target.value)} /></Field>
          <Field label="तहसील" required><input className={inputClass} value={form.tehsil} onChange={(e) => set("tehsil", e.target.value)} placeholder="तहसील का नाम" /></Field>
          <Field label="जिला" required><input className={inputClass} value={form.district} onChange={(e) => set("district", e.target.value)} placeholder="जिला का नाम" /></Field>
          <Field label="राज्य" required>
            <input className={inputClass} value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="राजस्थान" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="पता"><textarea className={inputClass} rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
          </div>

          {/* स्वयंसेवक */}
          <div className="sm:col-span-2 rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={wantVolunteer}
                onChange={(e) => { setWantVolunteer(e.target.checked); if (!e.target.checked) setVolunteerAreas([]); }}
                className="mt-1 h-4 w-4 accent-green-600"
              />
              <div>
                <p className="font-semibold text-green-800">🙋 क्या आप स्वयंसेवक (Volunteer) के रूप में काम करना चाहेंगे?</p>
                <p className="text-xs text-green-700">संस्था के कार्यों में स्वेच्छा से सहयोग दें — कार्यक्रम, शिक्षा, पर्यावरण आदि। <span className="text-green-600">(Would you like to work as a Volunteer?)</span></p>
              </div>
            </label>
            {wantVolunteer && (
              <div>
                <p className="mb-2 text-xs font-medium text-green-800">किस क्षेत्र में सहयोग देना चाहते हैं? <span className="text-red-500">*</span></p>
                <div className="flex flex-wrap gap-2">
                  {VOLUNTEER_AREAS.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleArea(area)}
                      className={cn(
                        "rounded-xl border px-3 py-1.5 text-xs font-medium transition",
                        volunteerAreas.includes(area)
                          ? "border-green-500 bg-green-600 text-white"
                          : "border-green-200 bg-white text-green-700 hover:border-green-400"
                      )}
                    >
                      {area}
                    </button>
                  ))}
                </div>
                {wantVolunteer && volunteerAreas.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">कम से कम एक क्षेत्र चुनें।</p>
                )}
              </div>
            )}
          </div>

          {/* पासवर्ड — login credentials */}
          <div className="sm:col-span-2 rounded-xl border border-saffron-200 bg-saffron-50 p-4 space-y-3">
            <p className="text-xs font-semibold text-saffron-800">🔑 लॉगिन पासवर्ड बनाएँ</p>
            <p className="text-xs text-stone-600">यह पासवर्ड आप मोबाइल या ईमेल के साथ NYS पोर्टल में लॉगिन करने के लिए उपयोग करेंगे।</p>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">पासवर्ड <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="कम से कम 6 अक्षर"
                  className={cn(inputClass, "pr-10")}
                />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600" tabIndex={-1}>
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">पासवर्ड दोबारा डालें <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="पासवर्ड पुनः दर्ज करें"
                  className={cn(inputClass, "pr-10", confirmPassword && password !== confirmPassword ? "border-red-400" : "")}
                />
                <button type="button" onClick={() => setShowConfirmPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600" tabIndex={-1}>
                  {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600">पासवर्ड मेल नहीं खाते</p>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {/* Plan selection */}
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

          {/* Bank + UPI details — shown here so member can pay while choosing plan */}
          {hasBank && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
              <p className="mb-3 text-sm font-bold text-amber-900">💳 भुगतान विवरण — यहाँ ट्रांसफर करें</p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {/* Bank info */}
                <div className="flex-1 space-y-1.5 text-sm text-stone-700">
                  {bank?.upiId && (
                    <div className="flex items-center gap-2">
                      <span className="w-20 shrink-0 text-xs font-semibold text-stone-500">UPI ID</span>
                      <span className="rounded bg-white px-2 py-0.5 font-mono font-semibold text-saffron-800 border border-saffron-200 select-all">{bank.upiId}</span>
                    </div>
                  )}
                  {bank?.accountName && (
                    <div className="flex items-start gap-2">
                      <span className="w-20 shrink-0 text-xs font-semibold text-stone-500">खाता नाम</span>
                      <span>{bank.accountName}</span>
                    </div>
                  )}
                  {bank?.bankName && (
                    <div className="flex items-start gap-2">
                      <span className="w-20 shrink-0 text-xs font-semibold text-stone-500">बैंक</span>
                      <span>{bank.bankName}{bank.branch ? ` (${bank.branch})` : ""}</span>
                    </div>
                  )}
                  {bank?.accountNumber && (
                    <div className="flex items-center gap-2">
                      <span className="w-20 shrink-0 text-xs font-semibold text-stone-500">खाता नं.</span>
                      <span className="rounded bg-white px-2 py-0.5 font-mono border border-stone-200 select-all">{bank.accountNumber}</span>
                    </div>
                  )}
                  {bank?.ifsc && (
                    <div className="flex items-center gap-2">
                      <span className="w-20 shrink-0 text-xs font-semibold text-stone-500">IFSC</span>
                      <span className="font-mono">{bank.ifsc}</span>
                    </div>
                  )}
                  <p className="mt-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs text-amber-800">
                    ⚡ चुनी हुई योजना की राशि <strong>{formatINR(plans.find(p => p.id === planId)?.amount ?? 0)}</strong> ट्रांसफर करें, फिर अगले चरण में रसीद अपलोड करें।
                  </p>
                </div>
                {/* UPI QR — dynamic with plan amount pre-filled */}
                {(upiQrDataUrl || bank?.upiQrUrl) && (
                  <div className="flex shrink-0 flex-col items-center gap-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={upiQrDataUrl || bank?.upiQrUrl!}
                      alt="UPI QR"
                      className="h-44 w-44 rounded-xl border border-amber-200 bg-white object-contain p-1 shadow-sm"
                    />
                    {upiQrDataUrl ? (
                      <span className="text-[11px] font-bold text-green-700">
                        ✅ {formatINR(selectedPlan?.amount ?? 0)} — QR स्कैन करें
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-stone-500">UPI QR स्कैन करें</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {!hasBank && (
            <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-500">
              💡 बैंक/UPI विवरण Admin → Settings में जोड़ें — तब यहाँ दिखेगा।
            </div>
          )}
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
          <Button onClick={() => { if (step === 1) { uploadPhotoAndAdvance(); return; } setStep((s) => s + 1); }} disabled={loading}>
            {loading && step === 1 ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
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
