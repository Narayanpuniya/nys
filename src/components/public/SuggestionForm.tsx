"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2, MessageSquarePlus } from "lucide-react";
import { Field, inputClass } from "@/components/ui/primitives";

const CATEGORIES = [
  { value: "SUGGESTION", label: "💡 सुझाव" },
  { value: "PROBLEM",    label: "🚨 समस्या" },
  { value: "COMPLAINT",  label: "📢 शिकायत" },
  { value: "FEEDBACK",   label: "🌟 प्रतिक्रिया" },
  { value: "OTHER",      label: "📌 अन्य" },
];

export function SuggestionForm({
  defaultName = "",
  defaultMemberCode = "",
  compact = false,
}: {
  defaultName?: string;
  defaultMemberCode?: string;
  compact?: boolean;
}) {
  const [form, setForm] = useState({
    name: defaultName,
    subject: "",
    category: "SUGGESTION",
    body: "",
    memberCode: defaultMemberCode,
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) setDone(true);
      else setError(data.error || "कुछ समस्या हुई।");
    } catch { setError("नेटवर्क error — पुनः प्रयास करें।"); }
    finally { setLoading(false); }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-green-50 border border-green-200 py-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
        <p className="text-lg font-bold text-green-800">धन्यवाद! 🙏</p>
        <p className="text-sm text-green-700 mt-1">आपका सुझाव/समस्या प्राप्त हो गई है।<br />हम जल्द समाधान करेंगे।</p>
        <button
          onClick={() => { setDone(false); setForm({ name: defaultName, subject: "", category: "SUGGESTION", body: "", memberCode: defaultMemberCode }); }}
          className="mt-4 rounded-xl border border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
        >
          और भेजें
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* श्रेणी */}
      <div className="grid grid-cols-5 gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setForm((f) => ({ ...f, category: c.value }))}
            className={`rounded-xl border py-2 text-xs font-semibold transition ${
              form.category === c.value
                ? "border-saffron-400 bg-saffron-50 text-saffron-800"
                : "border-stone-200 bg-white text-stone-500 hover:border-saffron-200"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* नाम — अगर defaultName है तो hidden */}
      {!defaultName && (
        <Field label="आपका नाम" required>
          <input value={form.name} onChange={set("name")} required className={inputClass} placeholder="पूरा नाम" />
        </Field>
      )}

      {/* सदस्य ID — अगर defaultMemberCode है तो hidden */}
      {!defaultMemberCode && (
        <Field label="सदस्य ID (वैकल्पिक)">
          <input value={form.memberCode} onChange={set("memberCode")} className={inputClass} placeholder="NYS-XXXXXX (यदि सदस्य हैं)" />
        </Field>
      )}

      <Field label="विषय" required>
        <input value={form.subject} onChange={set("subject")} required className={inputClass} placeholder="संक्षेप में बताएं..." />
      </Field>

      <Field label="विस्तार से बताएं" required>
        <textarea
          value={form.body}
          onChange={set("body")}
          required
          rows={compact ? 4 : 5}
          className={inputClass}
          placeholder="अपनी बात यहाँ लिखें — जितना विस्तार से बताएंगे, उतना बेहतर समाधान मिलेगा..."
        />
      </Field>

      {error && (
        <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-saffron-600 py-3 font-semibold text-white hover:bg-saffron-700 disabled:opacity-60"
      >
        {loading
          ? <><Loader2 className="h-4 w-4 animate-spin" /> भेजा जा रहा है...</>
          : <><Send className="h-4 w-4" /> भेजें</>
        }
      </button>
    </form>
  );
}
