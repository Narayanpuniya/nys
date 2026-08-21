"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { voidExpense, voidIncome } from "./actions";

export function FinanceDeleteButton({
  id,
  type,
  label,
}: {
  id: string;
  type: "income" | "expense";
  label: string; // e.g. "₹500 - कार्यक्रम"
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const word = type === "income" ? "आय" : "व्यय";
    if (!confirm(`यह ${word} entry निरस्त (VOID) करें?\n\n${label}\n\nRecord hidden हो जाएगा, delete नहीं।`)) return;
    startTransition(async () => {
      if (type === "income") await voidIncome(id);
      else await voidExpense(id);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      title="निरस्त करें"
      className="ml-2 inline-flex items-center justify-center rounded-lg border border-red-200 p-1 text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}
