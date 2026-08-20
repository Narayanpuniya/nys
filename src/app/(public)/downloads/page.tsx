"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Award, Receipt, ArrowRight, Download } from "lucide-react";

type Section = "idcard" | "cert" | "receipt";

function DownloadCard({
  icon: Icon,
  title,
  subtitle,
  placeholder,
  hint,
  buttonLabel,
  onSubmit,
  color,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  placeholder: string;
  hint: string;
  buttonLabel: string;
  onSubmit: (code: string) => void;
  color: string;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = code.trim();
    if (!val) { setError("कृपया कोड/संख्या दर्ज करें।"); return; }
    setError("");
    onSubmit(val);
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h2 className="text-lg font-bold text-stone-800">{title}</h2>
      <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(""); }}
            placeholder={placeholder}
            className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 outline-none focus:border-saffron-400 focus:ring-2 focus:ring-saffron-100"
          />
          <p className="mt-1 text-[11px] text-stone-400">{hint}</p>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #d97706, #7f1d1d)" }}
        >
          <Download className="h-4 w-4" />
          {buttonLabel}
        </button>
      </form>
    </div>
  );
}

export default function DownloadsPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "linear-gradient(135deg, #d97706, #7f1d1d)" }}>
          <Download className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-stone-800">डाउनलोड केंद्र</h1>
        <p className="mt-2 text-stone-500">
          अपना कोड या रसीद संख्या डालकर दस्तावेज़ डाउनलोड करें।
        </p>
      </div>

      {/* 3 Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <DownloadCard
          icon={CreditCard}
          title="सदस्य ID कार्ड"
          subtitle="डिजिटल सदस्य पहचान पत्र डाउनलोड करें।"
          placeholder="जैसे: NYS-2026-00001"
          hint="सदस्यता कोड — अनुमोदन पत्र में मिलेगा।"
          buttonLabel="ID कार्ड देखें / प्रिंट करें"
          color="bg-blue-600"
          onSubmit={(code) => window.open(`/id-card/${code}`, "_blank")}
        />

        <DownloadCard
          icon={Award}
          title="सदस्यता प्रमाण पत्र"
          subtitle="ऑफिशियल सदस्यता प्रमाण पत्र डाउनलोड करें।"
          placeholder="जैसे: NYS-2026-00001"
          hint="सदस्यता कोड — ID कार्ड पर भी लिखा होता है।"
          buttonLabel="प्रमाण पत्र देखें / प्रिंट करें"
          color="bg-green-600"
          onSubmit={(code) => window.open(`/certificate/${code}`, "_blank")}
        />

        <DownloadCard
          icon={Receipt}
          title="दान रसीद"
          subtitle="अपनी दान रसीद या पावती रसीद डाउनलोड करें।"
          placeholder="जैसे: DON-2026-00001"
          hint="रसीद संख्या — भुगतान के बाद मिली थी।"
          buttonLabel="रसीद देखें / प्रिंट करें"
          color="bg-amber-600"
          onSubmit={(code) => window.open(`/receipt/${code}`, "_blank")}
        />
      </div>

      {/* Info */}
      <div className="mt-8 rounded-2xl border border-stone-100 bg-stone-50 p-5 text-sm text-stone-600">
        <p className="font-semibold text-stone-700">📌 ध्यान दें</p>
        <ul className="mt-2 space-y-1.5 list-disc list-inside text-stone-500">
          <li>कोड/संख्या <strong>Case-Sensitive</strong> नहीं है — बड़े/छोटे अक्षर से फर्क नहीं पड़ता।</li>
          <li>सदस्यता कोड आपके <strong>अनुमोदन ईमेल</strong> या <strong>Member Portal</strong> में मिलेगा।</li>
          <li>रसीद संख्या <strong>भुगतान के बाद</strong> मिली थी (DON-YYYY-XXXXX)।</li>
          <li>कोई समस्या हो तो <a href="/contact" className="font-semibold text-saffron-700 hover:underline">संपर्क करें →</a></li>
        </ul>
      </div>
    </div>
  );
}
