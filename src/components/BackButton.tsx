"use client";

import { useRouter } from "next/navigation";

export function BackButton({
  label = "← वापस जाएं",
  fallback = "/",
  className = "",
}: {
  label?: string;
  fallback?: string;
  className?: string;
}) {
  const router = useRouter();

  function handleBack() {
    // If there's real history, go back; otherwise go to fallback page
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  }

  return (
    <button
      onClick={handleBack}
      className={`text-sm text-stone-500 hover:text-saffron-700 ${className}`}
    >
      {label}
    </button>
  );
}
