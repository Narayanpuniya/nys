import { cn } from "@/lib/utils";

// NYS logo mark — SVG fallback जब uploaded logo न हो।
export function LogoMark({ className, imageUrl }: { className?: string; imageUrl?: string | null }) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt="NYS"
        className={cn("h-10 w-10 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <svg viewBox="0 0 64 64" className={cn("h-10 w-10", className)} aria-hidden>
      <defs>
        <linearGradient id="nysg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff9d37" />
          <stop offset="0.6" stopColor="#ea6205" />
          <stop offset="1" stopColor="#a32a2a" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#nysg)" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * Math.PI) / 6;
        const x1 = 32 + Math.cos(a) * 20;
        const y1 = 32 + Math.sin(a) * 20;
        const x2 = 32 + Math.cos(a) * 27;
        const y2 = 32 + Math.sin(a) * 27;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#fff8ed"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.75"
          />
        );
      })}
      <circle cx="32" cy="32" r="16" fill="#fffaf2" />
      <text
        x="32"
        y="38"
        textAnchor="middle"
        fontSize="14"
        fontWeight="800"
        fill="#a32a2a"
        fontFamily="system-ui, sans-serif"
      >
        NYS
      </text>
    </svg>
  );
}

export function LogoFull({
  className,
  imageUrl,
  name = "नारायणपुरी यूथ सोसाइटी",
  place = "गुदियाल नगर",
}: {
  className?: string;
  imageUrl?: string | null;
  name?: string;
  place?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark imageUrl={imageUrl} />
      <div className="leading-tight">
        <div className="text-base font-extrabold text-ink">{name}</div>
        <div className="text-xs font-medium text-saffron-700">{place} · NYS</div>
      </div>
    </div>
  );
}
