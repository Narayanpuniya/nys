"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Entity = "campaign" | "event" | "volunteer" | "suggestion";

export function AdminDeleteButton({
  entity,
  id,
  label,
  compact = true,
  redirectTo,
}: {
  entity: Entity;
  id: string;
  label: string;        // shown in confirm dialog
  compact?: boolean;    // true = icon only, false = icon + text
  redirectTo?: string;  // navigate after delete
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const entityNames: Record<Entity, string> = {
    campaign: "अभियान",
    event: "कार्यक्रम",
    volunteer: "स्वयंसेवक",
    suggestion: "सुझाव",
  };

  async function handleDelete() {
    if (!confirm(`"${label}" ${entityNames[entity]} को डिलीट करें?\n\nयह पूरी तरह हट जाएगा।`)) return;
    setLoading(true);
    const res = await fetch("/api/admin/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity, id }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
      if (redirectTo) router.push(redirectTo);
    } else {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "Delete नहीं हो सका।");
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleDelete}
        disabled={loading}
        title="डिलीट करें"
        className="inline-flex items-center justify-center rounded-lg border border-red-200 p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      {loading ? "हट रहा है…" : "डिलीट"}
    </button>
  );
}
