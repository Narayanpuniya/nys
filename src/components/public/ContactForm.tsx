"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { Field, inputClass } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", mobile: "", email: "", message: "", website: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (res.ok) setDone(true);
      else setError((await res.json()).error || "कुछ समस्या हुई है।");
    } catch { setError("कुछ समस्या हुई है।"); }
    finally { setLoading(false); }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-green-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
        <p className="mt-2 font-semibold text-green-800">धन्यवाद! आपका संदेश प्राप्त हुआ।</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {/* honeypot (hidden from users) */}
      <input type="text" name="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="hidden" tabIndex={-1} autoComplete="off" />
      <Field label="नाम" required><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="मोबाइल"><input className={inputClass} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} inputMode="tel" /></Field>
        <Field label="ईमेल"><input className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} inputMode="email" /></Field>
      </div>
      <Field label="संदेश" required><textarea className={inputClass} rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required /></Field>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <Button disabled={loading} className="w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} संदेश भेजें
      </Button>
    </form>
  );
}
