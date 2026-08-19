import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/upload";

// ── POST: फ़ोटो अपलोड करें ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const files = form.getAll("files") as File[];
  const title    = String(form.get("title") ?? "").trim() || null;
  const category = String(form.get("category") ?? "General").trim() || "General";
  const rawDate  = String(form.get("date") ?? "").trim();
  const date     = rawDate ? new Date(rawDate) : new Date();

  if (!files.length) {
    return NextResponse.json({ error: "कोई फ़ाइल नहीं मिली।" }, { status: 400 });
  }

  const saved: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    try {
      const url = await saveUploadedImage(file, "gallery", { maxBytes: 5 * 1024 * 1024 });
      if (!url) { errors.push(`${file.name}: disk write विफल`); continue; }
      await prisma.galleryItem.create({ data: { title, category, imageUrl: url, date } });
      saved.push(url);
    } catch (e) {
      errors.push(`${file.name}: ${e instanceof Error ? e.message : "unknown"}`);
    }
  }

  return NextResponse.json({ saved: saved.length, errors });
}

// ── DELETE: एक आइटम हटाएँ ──────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id आवश्यक है" }, { status: 400 });

  await prisma.galleryItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
