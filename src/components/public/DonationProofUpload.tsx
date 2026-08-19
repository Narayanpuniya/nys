"use client";

import { useRef, useState } from "react";
import { Upload, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react";

export function DonationProofUpload({
  receiptNumber,
  existingProofUrl,
}: {
  receiptNumber: string;
  existingProofUrl?: string | null;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(!!existingProofUrl);
  const [proofUrl, setProofUrl] = useState<string | null>(existingProofUrl ?? null);
  const [error, setError] = useState("");

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError("फ़ाइल 5MB से बड़ी नहीं होनी चाहिए।"); return; }
    setError("");
    setPreview(URL.createObjectURL(f));
  }

  async function handleUpload() {
    const f = fileRef.current?.files?.[0];
    if (!f) { setError("पहले फ़ाइल चुनें।"); return; }
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("proof", f);
      const res = await fetch(`/api/donations/proof?receipt=${encodeURIComponent(receiptNumber)}`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "अपलोड विफल।"); return; }
      setUploaded(true);
      setProofUrl(data.proofUrl);
      setPreview(null);
    } catch {
      setError("नेटवर्क त्रुटि।");
    } finally {
      setUploading(false);
    }
  }

  if (uploaded && proofUrl) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
        <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-600" />
        <p className="font-semibold text-green-800">भुगतान प्रमाण अपलोड हो गया ✓</p>
        <p className="mt-1 text-xs text-green-600">Admin जल्द ही सत्यापित करेंगे।</p>
        {proofUrl.match(/\.(jpg|jpeg|png|webp)$/i) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={proofUrl} alt="proof" className="mx-auto mt-3 max-h-40 rounded-xl object-contain shadow" />
        )}
        <button
          onClick={() => { setUploaded(false); setProofUrl(null); }}
          className="mt-3 text-xs text-green-700 underline hover:no-underline"
        >
          बदलें
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-5">
      <h3 className="mb-3 font-semibold text-stone-800">
        📎 भुगतान रसीद / स्क्रीनशॉट अपलोड करें
      </h3>
      <p className="mb-4 text-xs text-stone-500">
        UPI स्क्रीनशॉट, बैंक ट्रांसफर रसीद, या कोई भी भुगतान प्रमाण (JPG, PNG, PDF · अधिकतम 5MB)
      </p>

      {/* File picker */}
      <div
        className="cursor-pointer rounded-xl border-2 border-dashed border-amber-200 bg-white p-4 transition hover:border-amber-400 hover:bg-amber-50"
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="mx-auto max-h-40 rounded-lg object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 py-4 text-stone-400">
            <ImageIcon className="h-8 w-8" />
            <span className="text-sm">फ़ाइल चुनने के लिए यहाँ दबाएँ</span>
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={onFileChange}
      />

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <button
        onClick={handleUpload}
        disabled={uploading || !preview}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-sm font-bold text-white transition hover:bg-amber-700 disabled:opacity-50"
      >
        {uploading
          ? <><Loader2 className="h-4 w-4 animate-spin" /> अपलोड हो रहा है…</>
          : <><Upload className="h-4 w-4" /> रसीद अपलोड करें</>
        }
      </button>
    </div>
  );
}
