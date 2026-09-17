import { GooglePlayIcon } from "@/components/ui/BrandIcons";
import { PLAY_STORE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

// "Google Play पर पाएँ" बटन — app के अंदर (display-mode: standalone) web-only class से छिप जाता है
export function PlayStoreBadge({
  top,
  bottom = "Google Play",
  className,
}: {
  top: string;
  bottom?: string;
  className?: string;
}) {
  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${top} ${bottom}`}
      className={cn(
        "web-only inline-flex items-center gap-2.5 rounded-xl border border-white/20 bg-black px-3.5 py-2 text-white shadow-sm transition hover:bg-stone-900 active:scale-[0.98]",
        className,
      )}
    >
      <GooglePlayIcon className="h-6 w-6 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="text-[9px] font-medium uppercase tracking-wider text-white/70">{top}</span>
        <span className="mt-0.5 text-[15px] font-semibold">{bottom}</span>
      </span>
    </a>
  );
}
