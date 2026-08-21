"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2, Loader2 } from "lucide-react";
import { restoreMember, permanentDeleteMember } from "../actions";

export function RestoreDeleteButtons({
  memberId,
  memberName,
}: {
  memberId: string;
  memberName: string;
}) {
  const [restorePending, startRestore] = useTransition();
  const [deletePending, startDelete] = useTransition();
  const router = useRouter();

  function handleRestore() {
    if (!confirm(`"${memberName}" को वापस ACTIVE करें?`)) return;
    startRestore(async () => {
      await restoreMember(memberId);
      router.refresh();
    });
  }

  function handlePermanentDelete() {
    if (
      !confirm(
        `⚠️ "${memberName}" को स्थायी रूप से हटाएं?\n\nयह data हमेशा के लिए DELETE हो जाएगा — वापस नहीं आएगा!\n\nक्या आप पक्के हैं?`
      )
    )
      return;
    startDelete(async () => {
      await permanentDeleteMember(memberId);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      {/* Restore */}
      <button
        onClick={handleRestore}
        disabled={restorePending || deletePending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-800 hover:bg-green-100 disabled:opacity-50"
      >
        {restorePending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RotateCcw className="h-3.5 w-3.5" />
        )}
        वापस करें
      </button>

      {/* Permanent Delete */}
      <button
        onClick={handlePermanentDelete}
        disabled={restorePending || deletePending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-400 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
      >
        {deletePending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
        स्थायी हटाएं
      </button>
    </div>
  );
}
