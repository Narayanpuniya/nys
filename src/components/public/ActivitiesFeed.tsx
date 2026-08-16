"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { PostCard, type PostCardData } from "./PostCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/primitives";
import { inputClass } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type Category = { slug: string; name: string };

// Inner-scroll feed: 1000+ posts होने पर भी homepage compact रहती है।
// Fixed-height container + internal scroll + load more + search + category filter।
export function ActivitiesFeed({
  categories,
  pageSize = 8,
  height = "h-[520px]",
}: {
  categories: Category[];
  pageSize?: number;
  height?: string;
}) {
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initial, setInitial] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  const load = useCallback(
    async (reset: boolean, nextPage: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(nextPage),
          pageSize: String(pageSize),
        });
        if (q) params.set("q", q);
        if (cat) params.set("category", cat);
        const res = await fetch(`/api/posts?${params.toString()}`);
        const data = await res.json();
        setTotal(data.total ?? 0);
        setPosts((prev) => (reset ? data.items : [...prev, ...data.items]));
      } catch {
        // silent — empty state रहेगा
      } finally {
        setLoading(false);
        setInitial(false);
      }
    },
    [q, cat, pageSize],
  );

  // search/category बदलने पर reset
  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      setPage(1);
      load(true, 1);
    }, 300);
    return () => clearTimeout(debounce.current);
  }, [q, cat, load]);

  const canLoadMore = posts.length < total;

  return (
    <div className="rounded-2xl border border-saffron-100 bg-white/70 p-4">
      {/* Controls */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="गतिविधि खोजें..."
            className={cn(inputClass, "pl-9")}
          />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className={cn(inputClass, "sm:w-56")}>
          <option value="">सभी श्रेणियाँ</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Scroll container */}
      <div ref={scrollRef} className={cn("nys-scroll space-y-3 overflow-y-auto pr-1", height)}>
        {initial ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState message="फिलहाल कोई गतिविधि उपलब्ध नहीं है।" />
        ) : (
          <>
            {posts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
            {canLoadMore && (
              <button
                onClick={() => {
                  const np = page + 1;
                  setPage(np);
                  load(false, np);
                }}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-saffron-200 bg-saffron-50 py-2.5 text-sm font-medium text-saffron-800 hover:bg-saffron-100"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                और देखें ({total - posts.length} शेष)
              </button>
            )}
          </>
        )}
      </div>

      <p className="mt-2 text-right text-xs text-stone-400">कुल {total} गतिविधियाँ</p>
    </div>
  );
}
