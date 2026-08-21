"use client";

import { useRef, useState } from "react";
import { Upload, X, CheckCircle2, AlertCircle, Download, FileSpreadsheet } from "lucide-react";
import { useRouter } from "next/navigation";

const EXPENSE_TEMPLATE = `दिनांक,श्रेणी,राशि,विवरण,माध्यम
15/08/2026,कार्यक्रम,2500,स्वतंत्रता दिवस कार्यक्रम खर्च,Cash
20/08/2026,यात्रा,800,जोधपुर बैठक यात्रा,UPI
10/08/2026,प्रिंट,350,बैनर प्रिंटिंग,Cash
`;

const INCOME_TEMPLATE = `दिनांक,श्रेणी,स्रोत,राशि,विवरण,माध्यम
15/08/2026,अनुदान,सरकारी,5000,जिला प्रशासन अनुदान,Bank
20/08/2026,दान,भंवरलाल आर्य,1000,वार्षिक सहयोग,Cash
`;

export function ImportFinanceModal() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"expense" | "income">("expense");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; total: number; errors: string[] } | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function downloadTemplate() {
    const csv = type === "expense" ? EXPENSE_TEMPLATE : INCOME_TEMPLATE;
    const name = type === "expense" ? "expense_template.csv" : "income_template.csv";
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setFile(null); setResult(null); setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true); setError(""); setResult(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    try {
      const res = await fetch("/api/admin/finance/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) setError(data.error || "कुछ गड़बड़ हुई।");
      else { setResult(data); router.refresh(); }
    } catch { setError("नेटवर्क error।"); }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); reset(); }}
        className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
      >
        <Upload className="h-4 w-4" /> बल्क एंट्री (CSV)
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-bold text-ink">Excel/CSV से bulk import</h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
            </div>

            {/* Type selector */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => { setType("expense"); reset(); }}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${type === "expense" ? "bg-red-50 text-red-700 border border-red-200" : "bg-stone-50 text-stone-600 border border-stone-200"}`}
              >
                💸 खर्च (Expense)
              </button>
              <button
                onClick={() => { setType("income"); reset(); }}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${type === "income" ? "bg-green-50 text-green-700 border border-green-200" : "bg-stone-50 text-stone-600 border border-stone-200"}`}
              >
                💰 आय (Income)
              </button>
            </div>

            {/* Template info */}
            <div className="mb-4 rounded-xl border border-stone-100 bg-stone-50 p-4">
              <p className="mb-1 text-sm font-medium text-stone-700">CSV columns ({type === "expense" ? "खर्च" : "आय"}):</p>
              {type === "expense" ? (
                <p className="mb-2 text-xs text-stone-500"><strong>दिनांक, श्रेणी, राशि, विवरण, माध्यम</strong><br/>
                  दिनांक: DD/MM/YYYY | माध्यम: Cash, UPI, Bank, Cheque</p>
              ) : (
                <p className="mb-2 text-xs text-stone-500"><strong>दिनांक, श्रेणी, स्रोत, राशि, विवरण, माध्यम</strong><br/>
                  Excel → Save As → CSV (UTF-8)</p>
              )}
              <button onClick={downloadTemplate} className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100">
                <Download className="h-3.5 w-3.5" /> Template download करें
              </button>
            </div>

            {/* File upload */}
            <div className="mb-4">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 py-5 hover:border-saffron-400 hover:bg-saffron-50">
                <Upload className="mb-2 h-7 w-7 text-stone-400" />
                <span className="text-sm font-medium text-stone-600">{file ? file.name : "CSV file चुनें"}</span>
                <span className="mt-1 text-xs text-stone-400">.csv format</span>
                <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden"
                  onChange={e => { setFile(e.target.files?.[0] ?? null); setResult(null); setError(""); }} />
              </label>
            </div>

            {result && (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-semibold">✅ {result.imported} records import हुए | ⚠️ {result.skipped} skip (total: {result.total})</span>
                </div>
                {result.errors.length > 0 && (
                  <details className="mt-2"><summary className="cursor-pointer text-xs text-amber-600">{result.errors.length} warnings</summary>
                    <ul className="mt-1 space-y-0.5 text-xs text-stone-500">{result.errors.map((e, i) => <li key={i}>• {e}</li>)}</ul>
                  </details>
                )}
              </div>
            )}

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50">बंद करें</button>
              <button
                onClick={handleImport} disabled={!file || loading}
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
