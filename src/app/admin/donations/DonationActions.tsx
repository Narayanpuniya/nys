"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DonationVerifyActions({ donationId, status }: { donationId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [done, setDone] = useState(false);

  if (status === "SUCCESS" || status === "FAILED" || status === "VOID" || done) return null;
  if (status !== "PAID" && status !== "PENDING") return null;

  async function act(action: "approve" | "reject") {
    setLoading(action);
    try {
      const res = await fetch("/api/admin/donations/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: donationId, action, note }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        router.refresh();
      } else {
        alert(data.error || "कार्रवाई विफल।");
      }
    } catch {
      alert("नेटवर्क त्रुटि।");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {showNote && (
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="नोट (वैकल्पिक)"
          className="mb-1 w-full rounded border border-stone-300 px-2 py-1 text-xs"
        />
      )}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => act("approve")}
          disabled={!!loading}
          className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
        >
          {loading === "approve" ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
          स्वीकृत
        </button>
        <button
          onClick={() => { setShowNote(true); act("reject"); }}
          disabled={!!loading}
          className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {loading === "reject" ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
          अस्वीकृत
        </button>
      </div>
    </div>
  );
}
