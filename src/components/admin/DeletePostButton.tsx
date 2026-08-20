"use client";

import { useState, useTransition } from "react";
import { hardDeletePost } from "@/app/admin/posts/actions";
import { Trash2, Loader2 } from "lucide-react";

export function DeletePostButton({ id, title }: { id: string; title: string }) {
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await hardDeletePost(id);
    });
  }

  if (confirm) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          {isPending ? "हटा रहे..." : "हाँ, हटाएँ"}
        </button>
        <button
          onClick={() => setConfirm(false)}
          disabled={isPending}
          className="rounded-lg border border-stone-300 px-2.5 py-1 text-xs font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-60"
        >
          नहीं
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      title={`"${title}" हटाएँ`}
      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-400"
    >
      <Trash2 className="h-3.5 w-3.5" /> हटाएँ
    </button>
  );
}
