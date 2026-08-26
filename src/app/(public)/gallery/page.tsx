import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getI18n } from "@/lib/i18n";
import { GalleryGrid } from "@/components/public/GalleryGrid";
import { SectionHeading } from "@/components/ui/primitives";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.gallery_title };
}
export const revalidate = 600;

export default async function GalleryPage() {
  const [galleryItems, posts, videos, { dict }] = await Promise.all([
    prisma.galleryItem.findMany({ orderBy: { date: "desc" } }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", OR: [{ mainImage: { not: null } }, { images: { not: null } }] },
      select: { id: true, title: true, mainImage: true, images: true, date: true, category: { select: { name: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.video.findMany({ orderBy: { date: "desc" } }),
    getI18n(),
  ]);

  const postImages: { id: string; title: string | null; imageUrl: string; category: string; date: string }[] = [];
  for (const post of posts) {
    const cat = post.category?.name ?? "Activity";
    if (post.mainImage) {
      postImages.push({ id: `post-main-${post.id}`, title: post.title, imageUrl: post.mainImage, category: cat, date: post.date.toISOString() });
    }
    if (post.images) {
      let urls: string[] = [];
      try { urls = JSON.parse(post.images); } catch { /* ignore */ }
      urls.forEach((url, i) => {
        if (url) postImages.push({ id: `post-img-${post.id}-${i}`, title: post.title, imageUrl: url, category: cat, date: post.date.toISOString() });
      });
    }
  }

  const seen = new Set<string>();
  const photoItems = [
    ...galleryItems.map((i) => ({ id: i.id, title: i.title ?? null, imageUrl: i.imageUrl, category: i.category, date: i.date.toISOString() })),
    ...postImages,
  ].filter((item) => {
    if (seen.has(item.imageUrl)) return false;
    seen.add(item.imageUrl);
    return true;
  });

  const videoItems = videos.map((v) => ({
    id: `video-${v.id}`, title: v.title, imageUrl: null, category: v.category,
    date: v.date.toISOString(), isVideo: true, videoUrl: v.videoUrl, thumbnail: v.thumbnail,
  }));

  const allItems = [...videoItems, ...photoItems].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading title={dict.gallery_title} subtitle={dict.gallery_sub} />
      <GalleryGrid items={allItems} />
    </div>
  );
}
