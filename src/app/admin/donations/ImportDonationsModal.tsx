"use client";

import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { useRouter } from "next/navigation";

const TEMPLATE_CSV = `नाम,मोबाइल,राशि,दिनांक,माध्यम,उद्देश्य,संदेश
राम कुमार,9876543210,500,15/08/2026,Cash,General,स्वतंत्रता दिवस दान
श्याम लाल,9812345678,1000,20/08/2026,UPI,Education,शिक्षा सहयोग
गीता देवी,,250,10/08/2026,Cash,General,
`;

export function ImportDonationsModal() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; total: number; errors: string[] } | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function downloadTemplate() {
    const blob = new Blob(["﻿" + TEMPLATE_CSV], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "donation_template.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true); setError(""); setResult(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/donations/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "कुछ गड़बड़ हुई।"); }
      else { setResult(data); router.refresh(); }
    } catch {
      setError("नेटवर्क error।");
    }
    setLoading(false);
  }

  function reset() {
    setFile(null); setResult(null); setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); reset(); }}
        className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
      >
        <Upload className="h-4 w-4" /> CSV Import
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-bold text-ink">Excel/CSV से दान import करें</h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
            </div>

            {/* Step 1: Template */}
            <div className="mb-4 rounded-xl border border-stone-100 bg-stone-50 p-4">
              <p className="mb-2 text-sm font-medium text-stone-700">Step 1 — Template download करें</p>
              <p className="mb-3 text-xs text-stone-500">
                CSV में ये columns होने चाहिए: <strong>नाम, मोबाइल, राशि, दिनांक, माध्यम, उद्देश्य, संदेश</strong><br />
                दिनांक format: DD/MM/YYYY (जैसे 15/08/2026)<br />
                माध्यम: Cash, UPI, Bank, Cheque, Card<br />
                Excel में है तो <strong>File → Save As → CSV (UTF-8)</strong> करें
              </p>
              <button onClick={downloadTemplate} className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100">
                <Download className="h-3.5 w-3.5" /> Template CSV download करें
              </button>
            </div>

            {/* Step 2: Upload */}
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-stone-700">Step 2 — अपनी CSV file चुनें</p>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 py-6 hover:border-saffron-400 hover:bg-saffron-50">
                <Upload className="mb-2 h-8 w-8 text-stone-400" />
                <span className="text-sm font-medium text-stone-600">{file ? file.name : "CSV file यहाँ click करके चुनें"}</span>
                <span className="mt-1 text-xs text-stone-400">.csv format (Excel से Save As → CSV)</span>
                <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={e => { setFile(e.target.files?.[0] ?? null); setResult(null); setError(""); }} />
              </label>
            </div>

            {/* Result */}
            {result && (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Import सफल!</span>
                </div>
                <p className="mt-1 text-sm text-green-700">
                  ✅ <strong>{result.imported}</strong> records import हुए &nbsp;|&nbsp;
                  ⚠️ <strong>{result.skipped}</strong> skip (total: {result.total})
                </p>
                {result.errors.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-amber-600">{result.errors.length} warnings देखें</summary>
                    <ul className="mt-1 space-y-0.5 text-xs text-stone-500">
                      {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
                    </ul>
                  </details>
                )}
              </div>
            )}

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50">
                बंद करें
              </button>
              <button
                onClick={handleImport}
                disabled={!file || loading}
                className="flex-1 rounded-xl bg-saffron-600 py-2.5 text-sm font-semibold text-white hover:bg-saffron-700 disabled:opacity-50"
              >
                {loading ? "Import हो रहा है..." : "🚀 Import करें"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
