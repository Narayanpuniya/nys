import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, ArrowLeft, User2, ArrowRight } from "lucide-react";
import { FacebookIcon, YoutubeIcon } from "@/components/ui/BrandIcons";
import { prisma } from "@/lib/db";
import { formatDateHi, safeJsonParse } from "@/lib/utils";
import { ShareButtons } from "@/components/public/ShareButtons";
import { PhotoSlideshow } from "@/components/public/PhotoSlideshow";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.post.findUnique({ where: { slug } });
  const headline = p?.headline?.trim() || p?.title;
  return {
    title: headline ?? "गतिविधि",
    description: p?.excerpt ?? undefined,
    openGraph: p?.mainImage ? { images: [p.mainImage] } : undefined,
  };
}

export default async function PostDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!post || post.status !== "PUBLISHED") notFound();

  // Related posts from same category
  const related = post.categoryId
    ? await prisma.post.findMany({
        where: {
          categoryId: post.categoryId,
          status: "PUBLISHED",
          NOT: { slug },
        },
        orderBy: [{ featured: "desc" }, { date: "desc" }],
        take: 4,
        include: { category: true },
      })
    : [];

  const images = safeJsonParse<string[]>(post.images, []);
  const displayHeadline = post.headline?.trim() || post.title;
  const reporter = post.reporter?.trim() || "NYS टीम";
  const catColor = post.category?.color ?? "#ea6205";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">

        {/* ══════════════════ Main Article ══════════════════ */}
        <article className="min-w-0 flex-1">

          {/* Back */}
          <Link
            href="/activities"
            className="inline-flex items-center gap-1 text-sm font-medium text-saffron-700 hover:text-saffron-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> सभी गतिविधियाँ
          </Link>

          {/* Category + featured badge */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {post.category && (
              <span
                className="rounded-full px-3 py-0.5 text-xs font-bold"
                style={{ backgroundColor: `${catColor}20`, color: catColor }}
              >
                {post.category.name}
              </span>
            )}
            {post.featured && (
              <span className="rounded-full bg-saffron-100 px-2.5 py-0.5 text-[10px] font-bold text-saffron-700">
                ⭐ विशेष
              </span>
            )}
          </div>

          {/* Headline */}
          <h1 className="mt-3 text-2xl font-extrabold leading-tight text-stone-900 sm:text-3xl">
            {displayHeadline}
          </h1>

          {/* Metadata bar */}
          <div className="mt-3 flex flex-wrap items-center gap-4 border-b border-stone-100 pb-4 text-sm text-stone-500">
            <span className="inline-flex items-center gap-1.5">
              <User2 className="h-4 w-4 shrink-0" /> {reporter}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 shrink-0" /> {formatDateHi(post.date)}
            </span>
            {post.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0" /> {post.location}
              </span>
            )}
          </div>

          {/* Photos — main + gallery as swipeable slideshow */}
          {(() => {
            const allPhotos = [
              ...(post.mainImage ? [post.mainImage] : []),
              ...images,
            ];
            if (allPhotos.length > 0) {
              return (
                <PhotoSlideshow
                  images={allPhotos}
                  altPrefix={displayHeadline}
                />
              );
            }
            return (
              <div className="mt-5 flex h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-saffron-50 to-amber-50">
                <span className="text-5xl opacity-20">🪔</span>
              </div>
            );
          })()}

          {/* Lead paragraph (excerpt) */}
          {post.excerpt && (
            <p className="mt-5 border-l-4 border-saffron-400 pl-4 text-base font-medium italic leading-relaxed text-stone-700">
              {post.excerpt}
            </p>
          )}

          {/* Full content */}
          <div className="mt-5 max-w-none whitespace-pre-line text-[15px] leading-8 text-stone-700">
            {post.content}
          </div>

          {/* Video / Social links */}
          {(post.youtubeUrl || post.facebookUrl) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {post.youtubeUrl && (
                <a
                  href={post.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  <YoutubeIcon className="h-4 w-4" /> वीडियो देखें
                </a>
              )}
              {post.facebookUrl && (
                <a
                  href={post.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <FacebookIcon className="h-4 w-4" /> Facebook पर देखें
                </a>
              )}
            </div>
          )}

          {/* Share */}
          <div className="mt-8 border-t border-stone-100 pt-6">
            <p className="mb-3 text-sm font-bold text-stone-700">साझा करें</p>
            <ShareButtons url={`/activities/${post.slug}`} text={displayHeadline} />
          </div>
        </article>

        {/* ══════════════════ Sidebar: Related News ══════════════════ */}
        {related.length > 0 && (
          <aside className="w-full shrink-0 lg:w-72">
            <h3 className="mb-3 border-b-2 border-saffron-500 pb-1.5 text-xs font-extrabold uppercase tracking-widest text-stone-800">
              इससे जुड़ी गतिविधियाँ
            </h3>
            <div className="space-y-3">
              {related.map((r) => {
                const rHeadline = r.headline?.trim() || r.title;
                const rColor = r.category?.color ?? "#ea6205";
                return (
                  <Link
                    key={r.slug}
                    href={`/activities/${r.slug}`}
                    className="group flex gap-2.5 rounded-xl border border-stone-100 bg-white p-2.5 transition hover:border-stone-200 hover:shadow-sm"
                  >
                    {r.mainImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.mainImage}
                        alt={rHeadline}
                        loading="lazy"
                        className="h-16 w-20 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg bg-saffron-50">
                        <span className="text-xl opacity-30">📰</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      {r.category && (
                        <span
                          className="text-[10px] font-bold uppercase"
                          style={{ color: rColor }}
                        >
                          {r.category.name}
                        </span>
                      )}
                      <p className="line-clamp-2 text-[12px] font-semibold leading-snug text-stone-800 transition-colors group-hover:text-saffron-800">
                        {rHeadline}
                      </p>
                      <p className="mt-0.5 text-[10px] text-stone-400">{formatDateHi(r.date)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <Link
              href="/activities"
              className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-saffron-200 bg-saffron-50 py-2 text-[12px] font-semibold text-saffron-800 transition hover:bg-saffron-100"
            >
              सभी गतिविधियाँ <ArrowRight className="h-3 w-3" />
            </Link>
          </aside>
        )}
      </div>
    </div>
  );
}
