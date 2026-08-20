import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { GalleryGrid } from "@/components/public/GalleryGrid";
import { SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "गैलरी" };
export const revalidate = 120;

export default async function GalleryPage() {
  // 1. Regular gallery items
  const galleryItems = await prisma.galleryItem.findMany({ orderBy: { date: "desc" } });

  // 2. Posts with images (mainImage + images JSON array)
  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { mainImage: { not: null } },
        { images: { not: null } },
      ],
    },
    select: {
      id: true,
      title: true,
      mainImage: true,
      images: true,
      date: true,
      category: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });

  // 3. Flatten post images into gallery items format
  const postImages: { id: string; title: string | null; imageUrl: string; category: string; date: string }[] = [];

  for (const post of posts) {
    const cat = post.category?.name ?? "गतिविधि";

    // mainImage
    if (post.mainImage) {
      postImages.push({
        id: `post-main-${post.id}`,
        title: post.title,
        imageUrl: post.mainImage,
        category: cat,
        date: post.date.toISOString(),
      });
    }

    // extra images (stored as JSON array string)
    if (post.images) {
      let urls: string[] = [];
      try { urls = JSON.parse(post.images); } catch { /* ignore */ }
      urls.forEach((url, i) => {
        if (url) {
          postImages.push({
            id: `post-img-${post.id}-${i}`,
            title: post.title,
            imageUrl: url,
            category: cat,
            date: post.date.toISOString(),
          });
        }
      });
    }
  }

  // 4. Merge all, sort by date desc, deduplicate by imageUrl
  const seen = new Set<string>();
  const allItems = [
    ...galleryItems.map((i) => ({
      id: i.id,
      title: i.title ?? null,
      imageUrl: i.imageUrl,
      category: i.category,
      date: i.date.toISOString(),
    })),
    ...postImages,
  ]
    .filter((item) => {
      if (seen.has(item.imageUrl)) return false;
      seen.add(item.imageUrl);
      return true;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading title="गैलरी" subtitle="हमारे कार्यक्रमों की झलकियाँ" />
      <GalleryGrid items={allItems} />
    </div>
  );
}
