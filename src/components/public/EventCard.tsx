import Link from "next/link";
import { CalendarDays, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { formatDateHi } from "@/lib/utils";

export type EventCardData = {
  slug: string;
  title: string;
  date: string;
  time?: string | null;
  venue?: string | null;
  posterImage?: string | null;
  status: string;
  category: string;
};

const statusTone: Record<string, "amber" | "green" | "blue" | "red"> = {
  UPCOMING: "amber",
  ONGOING: "green",
  COMPLETED: "blue",
  CANCELLED: "red",
};
const statusLabel: Record<string, string> = {
  UPCOMING: "आगामी",
  ONGOING: "जारी",
  COMPLETED: "संपन्न",
  CANCELLED: "रद्द",
};

export function EventCard({ e }: { e: EventCardData }) {
  return (
    <Link
      href={`/events/${e.slug}`}
      className="group flex gap-4 overflow-hidden rounded-2xl border border-saffron-100 bg-white p-4 transition hover:border-saffron-300 hover:shadow-md"
    >
      {/* पोस्टर या date box */}
      {e.posterImage ? (
        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-stone-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={e.posterImage} alt={e.title} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl nys-accent-bar text-white">
          <span className="text-xl font-extrabold leading-none">
            {new Date(e.date).getDate()}
          </span>
          <span className="text-[11px]">
            {new Intl.DateTimeFormat("hi-IN", { month: "short" }).format(new Date(e.date))}
          </span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <Badge tone={statusTone[e.status] ?? "neutral"}>{statusLabel[e.status] ?? e.status}</Badge>
        </div>
        <h3 className="line-clamp-1 font-semibold text-ink group-hover:text-saffron-800">{e.title}</h3>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDateHi(e.date)}</span>
          {e.time && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {e.time}</span>}
          {e.venue && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {e.venue}</span>}
        </div>
      </div>
    </Link>
  );
}
