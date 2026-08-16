import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { GalleryGrid } from "@/components/public/GalleryGrid";
import { SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "गैलरी" };
export const revalidate = 120;

export default async function GalleryPage() {
  const items = await prisma.galleryItem.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading title="गैलरी" subtitle="हमारे कार्यक्रमों की झलकियाँ" />
      <GalleryGrid items={items.map((i) => ({ id: i.id, title: i.title, imageUrl: i.imageUrl, category: i.category }))} />
    </div>
  );
}
