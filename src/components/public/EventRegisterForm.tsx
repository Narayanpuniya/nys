"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Field, inputClass } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";

export function EventRegisterForm({ eventId }: { eventId: string }) {
  const [form, setForm] = useState({ name: "", mobile: "", email: "", memberCode: "", participants: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [regNumber, setRegNumber] = useState("");

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, eventId }),
      });
      const data = await res.json();
      if (res.ok) setRegNumber(data.regNumber);
      else setError(data.error || "पंजीकरण विफल।");
    } catch {
      setError("कुछ समस्या हुई है।");
    } finally {
      setLoading(false);
    }
  }

  if (regNumber) {
    return (
      <div className="rounded-2xl bg-green-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
        <p className="mt-2 font-semibold text-green-800">पंजीकरण सफल!</p>
        <p className="mt-1 text-sm text-stone-600">आपका पंजीकरण नंबर:</p>
        <p className="text-lg font-bold text-ink">{regNumber}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Field label="नाम" required><input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
      <Field label="मोबाइल" required><input className={inputClass} value={form.mobile} onChange={(e) => set("mobile", e.target.value)} inputMode="tel" /></Field>
      <Field label="ईमेल"><input className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} inputMode="email" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="सदस्य ID (वैकल्पिक)"><input className={inputClass} value={form.memberCode} onChange={(e) => set("memberCode", e.target.value)} /></Field>
        <Field label="प्रतिभागी संख्या"><input className={inputClass} type="number" min={1} value={form.participants} onChange={(e) => set("participants", parseInt(e.target.value) || 1)} /></Field>
      </div>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <Button onClick={submit} disabled={loading} className="w-full">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />} पंजीकरण करें
      </Button>
    </div>
  );
}
