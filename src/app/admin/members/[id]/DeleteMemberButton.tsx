"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteMember } from "../actions";

export function DeleteMemberButton({ memberId, memberName, compact }: { memberId: string; memberName: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteMember(memberId);
    });
  }

  return (
    <>
      {/* Delete button */}
      <button
        onClick={() => setOpen(true)}
        title="डिलीट करें"
        className={compact
          ? "inline-flex items-center justify-center rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50"
          : "inline-flex items-center gap-1.5 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        }
      >
        <Trash2 className="h-4 w-4" />
        {!compact && <span>डिलीट करें</span>}
      </button>

      {/* Confirm dialog overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl">
              🗑️
            </div>
            <h2 className="mt-3 text-lg font-bold text-gray-900">सदस्य डिलीट करें?</h2>
            <p className="mt-1 text-sm text-gray-600">
              <span className="font-semibold">{memberName}</span> को डिलीट करने पर उनका डेटा छिप जाएगा। यह क्रिया पूर्ववत की जा सकती है।
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                रद्द करें
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isPending ? "डिलीट हो रहा है…" : "हाँ, डिलीट करें"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
