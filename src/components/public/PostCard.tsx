import Link from "next/link";
import { MapPin, CalendarDays, ArrowRight } from "lucide-react";
import { formatDateHi } from "@/lib/utils";

export type PostCardData = {
  slug: string;
  title: string;
  headline?: string | null;
  reporter?: string | null;
  priority?: string | null;
  featured?: boolean;
  date: string;
  location?: string | null;
  excerpt?: string | null;
  mainImage?: string | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  impactNumber?: number | null;
  impactLabel?: string | null;
};

/**
 * News-style compact card — horizontal layout with thumbnail.
 * Used in the ActivitiesFeed (inner-scrollable news feed).
 */
export function PostCard({ post }: { post: PostCardData }) {
  const displayHeadline = post.headline?.trim() || post.title;
  const reporter = post.reporter?.trim() || "NYS टीम";
  const isBreaking = post.priority === "BREAKING";
  const isImportant = post.priority === "IMPORTANT";
  const catColor = post.categoryColor ?? "#ea6205";

  return (
    <Link href={`/activities/${post.slug}`} className="group block">
      <article className="flex overflow-hidden rounded-xl border border-stone-100 bg-white shadow-sm transition-all duration-200 hover:border-stone-300 hover:shadow-md">

        {/* ── Thumbnail ── */}
        <div className="relative w-[88px] shrink-0 overflow-hidden sm:w-[148px]">
          {post.mainImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.mainImage}
              alt={displayHeadline}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            />
          ) : (
            <div className="flex h-full min-h-[106px] w-full items-center justify-center bg-gradient-to-br from-saffron-50 to-amber-50">
              <span className="text-3xl opacity-20">📰</span>
            </div>
          )}
          {/* BREAKING overlay */}
          {isBreaking && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-600 py-0.5 text-center text-[9px] font-black uppercase tracking-widest text-white">
              ● BREAKING
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-1 p-2.5 sm:p-3">

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5">
            {post.categoryName && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: `${catColor}18`, color: catColor }}
              >
                {post.categoryName}
              </span>
            )}
            {isImportant && !isBreaking && (
              <span className="rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                महत्वपूर्ण
              </span>
            )}
          </div>

          {/* Headline */}
          <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-stone-900 transition-colors group-hover:text-saffron-800 sm:text-[15px]">
            {displayHeadline}
          </h3>

          {/* Excerpt — hidden on mobile */}
          {post.excerpt && (
            <p className="hidden line-clamp-1 text-[11px] leading-relaxed text-stone-500 sm:block">
              {post.excerpt}
            </p>
          )}

          {/* Footer: metadata + read-more */}
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 pt-0.5">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] text-stone-400 sm:text-[11px]">
              <span className="inline-flex items-center gap-0.5">
                <CalendarDays className="h-2.5 w-2.5" /> {formatDateHi(post.date)}
              </span>
              {post.location && (
                <span className="inline-flex items-center gap-0.5">
                  <MapPin className="h-2.5 w-2.5" /> {post.location}
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-saffron-700 transition-all group-hover:gap-1 sm:text-[11px]">
              <span className="text-stone-300">|</span>
              {reporter}
              <span className="mx-0.5 text-stone-300">·</span>
              पूरा समाचार
              <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
