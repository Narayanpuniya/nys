"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, RotateCcw, XCircle } from "lucide-react";
import { voidExpense, voidIncome, restoreExpense, restoreIncome, permanentDeleteExpense, permanentDeleteIncome } from "./actions";

export function FinanceDeleteButton({
  id,
  type,
  status,
  label,
}: {
  id: string;
  type: "income" | "expense";
  status: string;
  label: string;
}) {
  const [voidPending, startVoid] = useTransition();
  const [restorePending, startRestore] = useTransition();
  const [permPending, startPerm] = useTransition();
  const router = useRouter();
  const word = type === "income" ? "आय" : "व्यय";

  function handleVoid() {
    if (!confirm(`यह ${word} entry निरस्त (VOID) करें?\n\n${label}\n\nRecord छुप जाएगा, वापस ला सकते हैं।`)) return;
    startVoid(async () => {
      if (type === "income") await voidIncome(id);
      else await voidExpense(id);
      router.refresh();
    });
  }

  function handleRestore() {
    if (!confirm(`यह ${word} entry वापस ACTIVE करें?\n\n${label}`)) return;
    startRestore(async () => {
      if (type === "income") await restoreIncome(id);
      else await restoreExpense(id);
      router.refresh();
    });
  }

  function handlePermanentDelete() {
    if (!confirm(`⚠️ यह ${word} entry स्थायी रूप से हटाएं?\n\n${label}\n\nयह data हमेशा के लिए DELETE होगा — वापस नहीं आएगा!`)) return;
    startPerm(async () => {
      if (type === "income") await permanentDeleteIncome(id);
      else await permanentDeleteExpense(id);
      router.refresh();
    });
  }

  const busy = voidPending || restorePending || permPending;

  if (status === "VOID") {
    // VOID entry: Restore + Permanent Delete
    return (
      <span className="ml-2 inline-flex items-center gap-1">
        <button
          onClick={handleRestore}
          disabled={busy}
          title="वापस करें"
          className="inline-flex items-center gap-0.5 rounded-lg border border-green-300 bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 hover:bg-green-100 disabled:opacity-40"
        >
          {restorePending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
          वापस
        </button>
        <button
          onClick={handlePermanentDelete}
          disabled={busy}
          title="स्थायी हटाएं"
          className="inline-flex items-center gap-0.5 rounded-lg border border-red-400 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 hover:bg-red-100 disabled:opacity-40"
        >
          {permPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
          हटाएं
        </button>
      </span>
    );
  }

  // ACTIVE entry: VOID button
  return (
    <button
      onClick={handleVoid}
      disabled={busy}
      title="निरस्त करें"
      className="ml-2 inline-flex items-center justify-center rounded-lg border border-red-200 p-1 text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
    >
      {voidPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}
