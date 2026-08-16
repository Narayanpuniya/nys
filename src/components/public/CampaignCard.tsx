import Link from "next/link";
import { Users } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/primitives";
import { formatINR } from "@/lib/utils";

export type CampaignCardData = {
  slug: string;
  title: string;
  coverImage?: string | null;
  goal: number;
  collected: number;
  remaining: number;
  percent: number;
  donors: number;
  status: string;
};

export function CampaignCard({ c }: { c: CampaignCardData }) {
  const achieved = c.percent >= 100;
  return (
    <Link
      href={`/campaigns/${c.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-saffron-100 bg-white transition hover:border-saffron-300 hover:shadow-lg"
    >
      <div
        className="relative h-40 bg-gradient-to-br from-saffron-100 to-maroon-100"
        style={
          c.coverImage
            ? { backgroundImage: `url(${c.coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      >
        {!c.coverImage && <div className="flex h-full items-center justify-center text-4xl">🎯</div>}
        {achieved && (
          <span className="absolute right-3 top-3 rounded-full bg-green-600 px-2.5 py-1 text-xs font-bold text-white shadow">
            TARGET ACHIEVED
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-bold text-ink group-hover:text-saffron-800">{c.title}</h3>
        <div className="mt-3">
          <ProgressBar percent={c.percent} />
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="font-bold text-saffron-800">{formatINR(c.collected)}</span>
            <span className="text-stone-500">लक्ष्य {formatINR(c.goal)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-stone-500">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {c.donors} दानदाता
            </span>
            <Badge tone={achieved ? "green" : "saffron"}>{c.percent}%</Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}
