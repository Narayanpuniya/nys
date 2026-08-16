import Link from "next/link";
import { MapPin, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { formatDateHi } from "@/lib/utils";

export type PostCardData = {
  slug: string;
  title: string;
  date: string;
  location?: string | null;
  excerpt?: string | null;
  mainImage?: string | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  impactNumber?: number | null;
  impactLabel?: string | null;
};

export function PostCard({ post }: { post: PostCardData }) {
  return (
    <Link
      href={`/activities/${post.slug}`}
      className="group flex gap-3 rounded-2xl border border-saffron-100 bg-white p-3 transition hover:border-saffron-300 hover:shadow-md"
    >
      <div
        className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-saffron-50"
        style={
          post.mainImage
            ? { backgroundImage: `url(${post.mainImage})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      >
        {!post.mainImage && (
          <div className="flex h-full w-full items-center justify-center text-2xl">🪔</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {post.categoryName && (
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{
                backgroundColor: `${post.categoryColor ?? "#ea6205"}1a`,
                color: post.categoryColor ?? "#ea6205",
              }}
            >
              {post.categoryName}
            </span>
          )}
          {post.impactNumber ? (
            <Badge tone="green">
              {post.impactNumber}+ {post.impactLabel ?? "लाभान्वित"}
            </Badge>
          ) : null}
        </div>
        <h3 className="line-clamp-2 font-semibold text-ink group-hover:text-saffron-800">
          {post.title}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" /> {formatDateHi(post.date)}
          </span>
          {post.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {post.location}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
