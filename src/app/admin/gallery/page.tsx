import { prisma } from "@/lib/db";
import { GalleryUploadForm } from "./GalleryUploadForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "गैलरी — NYS Admin" };

export default async function AdminGalleryPage() {
  const items = await prisma.galleryItem.findMany({ orderBy: { date: "desc" } });
  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink">गैलरी</h1>
      <GalleryUploadForm items={items} />
    </div>
  );
}
