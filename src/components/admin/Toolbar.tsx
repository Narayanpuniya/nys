"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Download } from "lucide-react";
import { useState, useEffect } from "react";

// Admin table toolbar: search + status filter + Excel export।
export function Toolbar({
  statusOptions,
  exportType,
  placeholder = "खोजें...",
}: {
  statusOptions?: { value: string; label: string }[];
  exportType?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(sp.toString());
      if (q) params.set("q", q); else params.delete("q");
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function setStatus(value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set("status", value); else params.delete("status");
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative min-w-52 flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-saffron-500"
        />
      </div>
      {statusOptions && (
        <select
          defaultValue={sp.get("status") ?? ""}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-saffron-500"
        >
          <option value="">सभी स्थिति</option>
          {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
      {exportType && (
        <a
          href={`/api/admin/export/${exportType}?${sp.toString()}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          <Download className="h-4 w-4" /> Excel
        </a>
      )}
    </div>
  );
}
