"use client";

import { Printer } from "lucide-react";

// Print → Save as PDF (browser-native, dependency-light)।
export function PrintButton({ label = "प्रिंट / PDF डाउनलोड" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-xl bg-saffron-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-saffron-700"
    >
      <Printer className="h-4 w-4" /> {label}
    </button>
  );
}
