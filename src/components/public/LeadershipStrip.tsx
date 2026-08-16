import { Phone } from "lucide-react";
import { Card } from "@/components/ui/primitives";

type Leader = {
  name: string;
  designation: string;
  photoUrl?: string | null;
  mobile?: string | null;
  responsibility?: string | null;
};

export function LeadershipStrip({ leaders }: { leaders: Leader[] }) {
  if (!leaders.length) {
    return (
      <p className="rounded-2xl border border-dashed border-saffron-200 p-6 text-center text-sm text-stone-500">
        नेतृत्व की जानकारी शीघ्र उपलब्ध होगी।
      </p>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {leaders.map((l) => (
        <Card key={l.name} className="flex items-center gap-4 p-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-saffron-100 text-3xl">
            {l.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={l.photoUrl} alt={l.name} className="h-full w-full object-cover" />
            ) : "🙏"}
          </div>
          <div className="min-w-0">
            <div className="inline-flex rounded-full bg-maroon-100 px-2 py-0.5 text-xs font-semibold text-maroon-800">
              {l.designation}
            </div>
            <h3 className="mt-1 font-bold text-ink">{l.name}</h3>
            {l.responsibility && (
              <p className="line-clamp-2 text-xs text-stone-500">{l.responsibility}</p>
            )}
            {l.mobile && (
              <a
                href={`tel:${l.mobile}`}
                className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-saffron-700"
              >
                <Phone className="h-3.5 w-3.5" /> कॉल करें
              </a>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
