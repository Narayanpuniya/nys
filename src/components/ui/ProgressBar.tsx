import { cn } from "@/lib/utils";

export function ProgressBar({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  const p = Math.max(0, Math.min(100, percent));
  return (
    <div className={cn("h-3 w-full overflow-hidden rounded-full bg-saffron-100", className)}>
      <div
        className="h-full rounded-full nys-accent-bar transition-all duration-700"
        style={{ width: `${p}%` }}
        role="progressbar"
        aria-valuenow={p}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
