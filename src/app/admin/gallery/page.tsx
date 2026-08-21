import { prisma } from "@/lib/db";
import { GalleryUploadForm } from "./GalleryUploadForm";
import { VideoUploadForm } from "./VideoUploadForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "गैलरी — NYS Admin" };

export default async function AdminGalleryPage() {
  const [items, videos] = await Promise.all([
    prisma.galleryItem.findMany({ orderBy: { date: "desc" } }),
    prisma.video.findMany({ orderBy: { date: "desc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink">गैलरी</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-stone-100 p-1 w-fit">
        <a href="#photos" className="rounded-lg px-4 py-2 text-sm font-medium text-stone-700 bg-white shadow-sm">📷 फ़ोटो</a>
        <a href="#videos" className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 hover:bg-white/70">🎬 Videos</a>
      </div>

      <div id="photos" className="mb-10">
        <GalleryUploadForm items={items} />
      </div>

      <div id="videos">
        <VideoUploadForm items={videos} />
      </div>
    </div>
  );
}
