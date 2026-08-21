import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { can, PERMISSIONS } from "@/lib/constants";
import { saveUploadedImage } from "@/lib/upload";

/** Instagram / YouTube URL को embed URL में convert करें */
function toEmbedUrl(url: string): string {
  // Instagram reel/post/tv
  const ig = url.match(/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
  if (ig) return `https://www.instagram.com/${ig[1]}/${ig[2]}/embed/`;
  // YouTube
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  return url;
}

// POST — नया video जोड़ें
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !can(user.role, PERMISSIONS.GALLERY_MANAGE))
    return NextResponse.json({ error: "अनुमति नहीं।" }, { status: 403 });

  const fd = await req.formData().catch(() => null);
  if (!fd) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const title    = String(fd.get("title") ?? "").trim();
  const category = String(fd.get("category") ?? "General").trim();
  const dateStr  = String(fd.get("date") ?? "").trim();
  const videoUrl = String(fd.get("videoUrl") ?? "").trim();

  if (!videoUrl) return NextResponse.json({ error: "Instagram/YouTube link आवश्यक है।" }, { status: 400 });
  if (!title)    return NextResponse.json({ error: "शीर्षक आवश्यक है।" }, { status: 400 });

  // Optional thumbnail upload
  const thumbFile = fd.get("thumbnail") as File | null;
  let thumbnail: string | null = null;
  if (thumbFile && thumbFile.size > 0) {
    thumbnail = await saveUploadedImage(thumbFile, "gallery", { maxBytes: 3 * 1024 * 1024 });
  }

  const embedUrl = toEmbedUrl(videoUrl);
  const date     = dateStr ? new Date(dateStr) : new Date();

  const video = await prisma.video.create({
    data: { title, category, videoUrl: embedUrl, thumbnail, date },
  });

  return NextResponse.json({ ok: true, id: video.id });
}

// DELETE — video हटाएं
export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !can(user.role, PERMISSIONS.GALLERY_MANAGE))
    return NextResponse.json({ error: "अनुमति नहीं।" }, { status: 403 });

  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.video.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// GET — सभी videos
export async function GET() {
  const videos = await prisma.video.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json(videos);
}
