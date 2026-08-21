"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Loader2, ArrowRight, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { PostCard, type PostCardData } from "./PostCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/primitives";
import { cn, formatDateHi } from "@/lib/utils";

type Category = { slug: string; name: string; color?: string | null };

// ─────────────────────────────────────────────────────────────────────────────
// Activity Ticker
// ─────────────────────────────────────────────────────────────────────────────
function ActivityTicker({ titles }: { titles: string[] }) {
  if (titles.length < 3) return null;
  const text = titles.join("   •   ");
  return (
    <div className="mb-3 flex items-stretch overflow-hidden rounded-lg border border-stone-100 bg-stone-50">
      <div className="flex shrink-0 items-center rounded-l-lg bg-saffron-600 px-2.5 py-1.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-white">ताज़ा</span>
      </div>
      <div className="relative min-w-0 flex-1 overflow-hidden py-1.5">
        <div className="nys-ticker-track text-[11px] font-medium text-stone-600">
          {text}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{text}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Featured Card
// ─────────────────────────────────────────────────────────────────────────────
function FeaturedCard({ post }: { post: PostCardData }) {
  const displayHeadline = post.headline?.trim() || post.title;
  const reporter = post.reporter?.trim() || "NYS टीम";
  const catColor = post.categoryColor ?? "#ea6205";

  return (
    <Link href={`/activities/${post.slug}`} className="group mb-3 block">
      <article className="overflow-hidden rounded-xl border-2 border-saffron-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-saffron-100 bg-saffron-50 px-3 py-1.5">
          <span className="text-[10px] font-bold text-saffron-700">⭐ विशेष</span>
          {post.categoryName && (
            <span className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: `${catColor}20`, color: catColor }}>
              {post.categoryName}
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-44 overflow-hidden bg-gradient-to-br from-saffron-50 to-amber-50 sm:h-auto sm:w-56 sm:shrink-0">
            {post.mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.mainImage} alt={displayHeadline} loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-5xl opacity-20">🪔</span>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-between p-4">
            <div>
              <h2 className="text-[16px] font-extrabold leading-snug text-stone-900 transition-colors group-hover:text-saffron-800 sm:text-[18px]">
                {displayHeadline}
              </h2>
              {post.excerpt && (
                <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-stone-500">{post.excerpt}</p>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-400">
                <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {formatDateHi(post.date)}</span>
                {post.location && (
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {post.location}</span>
                )}
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-saffron-700 transition-all group-hover:gap-1.5">
                {reporter} · पूरा पढ़ें <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Category Pills
// ─────────────────────────────────────────────────────────────────────────────
function CategoryPills({ categories, active, onChange }: {
  categories: Category[];
  active: string;
  onChange: (slug: string) => void;
}) {
  return (
    <div className="scrollbar-none flex gap-1.5 overflow-x-auto pb-0.5">
      <button onClick={() => onChange("")}
        className={cn("shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition",
          active === "" ? "bg-saffron-600 text-white shadow-sm" : "border border-stone-200 bg-white text-stone-600 hover:border-saffron-300 hover:bg-saffron-50")}>
        सभी
      </button>
      {categories.map((c) => (
        <button key={c.slug} onClick={() => onChange(active === c.slug ? "" : c.slug)}
          className={cn("shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition",
            active === c.slug ? "shadow-sm text-white" : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300")}
          style={active === c.slug ? { backgroundColor: c.color ?? "#ea6205" } : {}}>
          {c.name}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Feed — inner scroll box रहेगा, bottom पर page scroll हो जाएगा
// ─────────────────────────────────────────────────────────────────────────────
export function ActivitiesFeed({
  categories,
  pageSize = 8,
  height = "h-[700px]",
}: {
  categories: Category[];
  pageSize?: number;
  height?: string;
}) {
  const [posts, setPosts]   = useState<PostCardData[]>([]);
  const [q, setQ]           = useState("");
  const [cat, setCat]       = useState("");
  const [page, setPage]     = useState(1);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const debounce  = useRef<ReturnType<typeof setTimeout>>(undefined);

  const load = useCallback(async (reset: boolean, nextPage: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(nextPage), pageSize: String(pageSize) });
      if (q)   params.set("q",        q);
      if (cat) params.set("category", cat);
      const res  = await fetch(`/api/posts?${params.toString()}`);
      const data = await res.json();
      setTotal(data.total ?? 0);
      setPosts((prev) => (reset ? data.items : [...prev, ...data.items]));
      setPage(nextPage);
    } catch { /* silent */ } finally {
      setLoading(false);
      setInitial(false);
    }
  }, [q, cat, pageSize]);

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { setPage(1); load(true, 1); }, 300);
    return () => clearTimeout(debounce.current);
  }, [q, cat, load]);

  // ── Inner scroll: जब bottom पर पहुँचे → page को नीचे scroll करो ──
  const handleInnerScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    if (atBottom) {
      // Load more अगर बाकी है
      if (!loading && posts.length < total) {
        load(false, page + 1);
      }
      // Page को नीचे scroll करो ताकि footer दिखे
      window.scrollBy({ top: 300, behavior: "smooth" });
    }
  }, [loading, posts.length, total, page, load]);

  const canLoadMore = posts.length < total;

  const showFeatured = !q && !cat;
  const featuredPost = showFeatured ? posts.find((p) => p.featured) : undefined;
  const regularPosts = featuredPost ? posts.filter((p) => p.slug !== featuredPost.slug) : posts;
  const tickerTitles = posts.slice(0, 10).map((p) => p.headline?.trim() || p.title);

  return (
    <div>
      <ActivityTicker titles={tickerTitles} />

      <div className="overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm">

        {/* Controls */}
        <div className="border-b border-stone-100 bg-stone-50/60 px-4 py-3">
          <div className="mb-2.5 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="गतिविधि खोजें..."
                className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-8 pr-8 text-[13px] text-stone-800 outline-none placeholder:text-stone-400 focus:border-saffron-400 focus:ring-1 focus:ring-saffron-100" />
              {q && (
                <button onClick={() => setQ("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">✕</button>
              )}
            </div>
          </div>
          <CategoryPills categories={categories} active={cat} onChange={(s) => setCat(s)} />
        </div>

        {/* Feed — inner scroll box */}
        <div
          ref={scrollRef}
          onScroll={handleInnerScroll}
          className={cn("nys-scroll overflow-y-auto px-4 py-3", height)}
        >
          {initial ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : posts.length === 0 ? (
            <EmptyState message="इस श्रेणी में कोई गतिविधि उपलब्ध नहीं है।" />
          ) : (
            <>
              {featuredPost && (
                <>
                  <FeaturedCard post={featuredPost} />
                  {regularPosts.length > 0 && (
                    <div className="my-3 flex items-center gap-2">
                      <div className="h-px flex-1 bg-stone-100" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">नवीनतम</span>
                      <div className="h-px flex-1 bg-stone-100" />
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2.5">
                {regularPosts.map((p) => <PostCard key={p.slug} post={p} />)}
              </div>

              {/* Load more button inside scroll box */}
              {canLoadMore && (
                <button
                  onClick={() => { load(false, page + 1); }}
                  disabled={loading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-saffron-200 bg-saffron-50 py-2.5 text-[13px] font-semibold text-saffron-800 transition hover:bg-saffron-100 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  और देखें ({total - posts.length} शेष)
                </button>
              )}

              {/* All loaded — सब दिख गया */}
              {!canLoadMore && posts.length > 0 && (
                <div className="mt-4 py-3 text-center text-[11px] text-stone-400">
                  ✅ सभी {total} गतिविधियाँ दिखाई दीं
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer bar */}
        <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50/40 px-4 py-2">
          <span className="text-[11px] text-stone-400">कुल {total} गतिविधियाँ</span>
          <Link href="/activities"
            className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-saffron-700 transition-all hover:gap-1">
            सभी गतिविधियाँ <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
