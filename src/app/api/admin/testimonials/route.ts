import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/upload";

export async function GET() {
  if (!await getSessionUser()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const items = await prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  if (!await getSessionUser()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const fd = await req.formData();
  const name        = (fd.get("name") as string)?.trim();
  const designation = (fd.get("designation") as string)?.trim() || null;
  const message     = (fd.get("message") as string)?.trim();
  const isPublished = fd.get("isPublished") !== "false";
  const sortOrder   = parseInt((fd.get("sortOrder") as string) || "0") || 0;
  const photo       = fd.get("photo") as File | null;

  if (!name || !message) return NextResponse.json({ error: "Name and message required" }, { status: 400 });

  let photoUrl: string | null = null;
  if (photo && photo.size > 0) {
    photoUrl = await saveUploadedImage(photo, "testimonials");
  }

  const item = await prisma.testimonial.create({
    data: { name, designation, message, photoUrl, isPublished, sortOrder },
  });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest) {
  if (!await getSessionUser()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const fd = await req.formData();
  const id          = (fd.get("id") as string)?.trim();
  const name        = (fd.get("name") as string)?.trim();
  const designation = (fd.get("designation") as string)?.trim() || null;
  const message     = (fd.get("message") as string)?.trim();
  const isPublished = fd.get("isPublished") !== "false";
  const sortOrder   = parseInt((fd.get("sortOrder") as string) || "0") || 0;
  const photo       = fd.get("photo") as File | null;

  if (!id || !name || !message) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const data: Record<string, unknown> = { name, designation, message, isPublished, sortOrder };
  if (photo && photo.size > 0) {
    data.photoUrl = await saveUploadedImage(photo, "testimonials");
  }

  const item = await prisma.testimonial.update({ where: { id }, data });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  if (!await getSessionUser()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.testimonial.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
