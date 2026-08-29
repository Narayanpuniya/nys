"use client";

import { useState } from "react";

type Props = {
  id: string;
  name: string;
  designation?: string | null;
  message: string;
  photoUrl?: string | null;
};

export function TestimonialCard({ name, designation, message, photoUrl }: Props) {
  const SHORT_LIMIT = 180;
  const isLong = message.length > SHORT_LIMIT;
  const [expanded, setExpanded] = useState(false);

  const displayText = isLong && !expanded ? message.slice(0, SHORT_LIMIT).trimEnd() + "…" : message;

  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm flex flex-col gap-3">
      {/* Quote mark */}
      <div className="text-4xl leading-none text-saffron-300 font-serif select-none">&ldquo;</div>

      {/* Message */}
      <div className="text-sm leading-relaxed text-stone-600 flex-1 whitespace-pre-line">
        {displayText}
        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="ml-1 inline-flex items-center gap-0.5 font-semibold text-saffron-700 hover:text-saffron-900 transition-colors"
          >
            {expanded ? " कम दिखाएँ ▲" : " पूरा पढ़ें ▼"}
          </button>
        )}
      </div>

      {/* Person */}
      <div className="flex items-center gap-3 border-t border-amber-50 pt-4">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={name}
            className="h-11 w-11 rounded-full object-cover border-2 border-saffron-200 shrink-0"
          />
        ) : (
          <div className="h-11 w-11 rounded-full bg-saffron-100 flex items-center justify-center shrink-0 text-saffron-700 font-bold text-lg">
            {name.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-semibold text-maroon-900 text-sm truncate">{name}</div>
          {designation && <div className="text-xs text-stone-400 truncate">{designation}</div>}
        </div>
      </div>
    </div>
  );
}
