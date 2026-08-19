"use client";

export function BackButton({ label = "← वापस जाएं", className = "" }: { label?: string; className?: string }) {
  return (
    <button
      onClick={() => window.history.back()}
      className={`text-sm text-stone-500 hover:text-saffron-700 ${className}`}
    >
      {label}
    </button>
  );
}
