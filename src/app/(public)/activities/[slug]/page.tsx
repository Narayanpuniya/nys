import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { FacebookIcon, YoutubeIcon } from "@/components/ui/BrandIcons";
import { prisma } from "@/lib/db";
import { formatDateHi, safeJsonParse } from "@/lib/utils";
import { Badge } from "@/components/ui/primitives";
import { ShareButtons } from "@/components/public/ShareButtons";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.post.findUnique({ where: { slug } });
  return {
    title: p?.title ?? "गतिविधि",
    description: p?.excerpt ?? undefined,
    openGraph: p?.mainImage ? { images: [p.mainImage] } : undefined,
  };
}

export default async function PostDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug }, include: { category: true } });
  if (!post || post.status !== "PUBLISHED") notFound();

  const images = safeJsonParse<string[]>(post.images, []);
  const tags = safeJsonParse<string[]>(post.tags, []);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/activities" className="text-sm text-saffron-700">← सभी गतिविधियाँ</Link>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {post.category && (
          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: `${post.category.color}1a`, color: post.category.color ?? "#ea6205" }}>
            {post.category.name}
          </span>
        )}
        {post.impactNumber ? <Badge tone="green">{post.impactNumber}+ {post.impactLabel ?? "लाभान्वित"}</Badge> : null}
      </div>

      <h1 className="mt-2 text-3xl font-extrabold text-ink">{post.title}</h1>
      <div className="mt-2 flex flex-wrap gap-4 text-sm text-stone-500">
        <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" /> {formatDateHi(post.date)}</span>
        {post.location && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {post.location}</span>}
      </div>

      <div
        className="mt-6 flex h-64 items-center justify-center rounded-2xl bg-saffron-50 text-6xl"
        style={post.mainImage ? { backgroundImage: `url(${post.mainImage})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        {!post.mainImage && "🪔"}
      </div>

      <div className="prose mt-6 max-w-none whitespace-pre-line text-stone-700">{post.content}</div>

      {images.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" className="h-32 w-full rounded-xl object-cover" />
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {post.youtubeUrl && (
          <a href={post.youtubeUrl} target="_blank" className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white"><YoutubeIcon className="h-4 w-4" /> वीडियो</a>
        )}
        {post.facebookUrl && (
          <a href={post.facebookUrl} target="_blank" className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white"><FacebookIcon className="h-4 w-4" /> Facebook</a>
        )}
      </div>

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((t) => <span key={t} className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">#{t}</span>)}
        </div>
      )}

      <div className="mt-8 border-t border-stone-200 pt-6">
        <p className="mb-2 text-sm font-medium text-ink">साझा करें</p>
        <ShareButtons url={`/activities/${post.slug}`} text={post.title} />
      </div>
    </article>
  );
}
