"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteMember } from "../actions";

export function DeleteMemberButton({
  memberId,
  memberName,
  compact,
  redirectTo,
}: {
  memberId: string;
  memberName: string;
  compact?: boolean;
  redirectTo?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`"${memberName}" को डिलीट करें?\n\nData छुप जाएगा (बाद में restore हो सकता है)।`)) return;
    startTransition(async () => {
      await deleteMember(memberId);
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });
  }

  if (compact) {
    return (
      <button
        onClick={handleDelete}
        disabled={isPending}
        title="डिलीट करें"
        className="inline-flex items-center justify-center rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      {isPending ? "डिलीट हो रहा है…" : "डिलीट करें"}
    </button>
  );
}
