import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const items = await prisma.galleryItem.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold text-ink">गैलरी ({items.length})</h1>
      <Card className="p-5">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {items.map((i) => (
            <div key={i.id} className="aspect-square overflow-hidden rounded-lg bg-saffron-100">
              {i.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={i.imageUrl} alt={i.title ?? ""} className="h-full w-full object-cover" />
              ) : <div className="flex h-full items-center justify-center text-2xl">🖼️</div>}
            </div>
          ))}
        </div>
        {items.length === 0 && <p className="text-sm text-stone-400">कोई चित्र नहीं।</p>}
      </Card>
      <p className="mt-4 text-sm text-stone-400">नोट: image upload फॉर्म भविष्य में; अभी seed/DB से URL जोड़े जाते हैं।</p>
    </div>
  );
}
