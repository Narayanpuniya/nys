import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/constants";
import { getHeroSlides, saveHeroSlides, DEFAULT_HERO_SLIDES, type HeroSlide } from "@/lib/settings";
import { saveUploadedImage } from "@/lib/upload";
import { randomBytes } from "crypto";

// GET — सभी slides
export async function GET() {
  await requirePermission(PERMISSIONS.SETTINGS_MANAGE);
  const slides = await getHeroSlides();
  return NextResponse.json(slides);
}

// POST — नई slide add (image upload + title)
export async function POST(req: NextRequest) {
  await requirePermission(PERMISSIONS.SETTINGS_MANAGE);
  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  const title = String(formData.get("title") ?? "").trim() || undefined;

  if (!file) return NextResponse.json({ error: "Image required" }, { status: 400 });

  const imageUrl = await saveUploadedImage(file, "slider");
  if (!imageUrl) return NextResponse.json({ error: "Upload failed" }, { status: 500 });

  const slides = await getHeroSlides();
  const newSlide: HeroSlide = {
    id: randomBytes(8).toString("hex"),
    imageUrl,
    title,
    sortOrder: slides.length,
  };
  slides.push(newSlide);
  await saveHeroSlides(slides);
  return NextResponse.json(newSlide);
}

// DELETE — slide हटाएं (id query param)
export async function DELETE(req: NextRequest) {
  await requirePermission(PERMISSIONS.SETTINGS_MANAGE);
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const slides = await getHeroSlides();
  const updated = slides.filter((s) => s.id !== id).map((s, i) => ({ ...s, sortOrder: i }));
  await saveHeroSlides(updated);
  return NextResponse.json({ ok: true });
}

// PUT — NYS default slides load करें (सभी पुरानी slides replace)
export async function PUT() {
  await requirePermission(PERMISSIONS.SETTINGS_MANAGE);
  await saveHeroSlides(DEFAULT_HERO_SLIDES);
  return NextResponse.json({ slides: DEFAULT_HERO_SLIDES });
}

// PATCH — reorder (body: [{id, sortOrder}...])
export async function PATCH(req: NextRequest) {
  await requirePermission(PERMISSIONS.SETTINGS_MANAGE);
  const body = (await req.json()) as { id: string; sortOrder: number }[];
  const slides = await getHeroSlides();
  const orderMap = new Map(body.map((b) => [b.id, b.sortOrder]));
  const updated = slides
    .map((s) => ({ ...s, sortOrder: orderMap.has(s.id) ? (orderMap.get(s.id) ?? s.sortOrder) : s.sortOrder }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  await saveHeroSlides(updated);
  return NextResponse.json({ ok: true });
}
