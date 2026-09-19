import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/upload";

/** किसी एक बही-entry के साथ काम/चेक/मीटिंग की फोटो जोड़ना-हटाना। */

async function guard() {
  return (await getSessionUser()) ? null : NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function POST(req: NextRequest) {
  const bad = await guard();
  if (bad) return bad;

  const fd = await req.formData();
  const entryId = String(fd.get("entryId") ?? "").trim();
  if (!entryId) return NextResponse.json({ error: "entryId चाहिए" }, { status: 400 });

  const entry = await prisma.cashBookEntry.findUnique({ where: { id: entryId } });
  if (!entry) return NextResponse.json({ error: "entry नहीं मिली" }, { status: 404 });

  const files = fd.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return NextResponse.json({ error: "कोई फोटो नहीं मिली" }, { status: 400 });

  const caption = String(fd.get("caption") ?? "").trim() || null;
  const last = await prisma.cashBookPhoto.findFirst({
    where: { entryId },
    orderBy: { sortOrder: "desc" },
  });

  const saved: string[] = [];
  const failed: string[] = [];
  let order = (last?.sortOrder ?? 0) + 1;
  for (const f of files) {
    const url = await saveUploadedImage(f, "cashbook", { maxBytes: 5 * 1024 * 1024 });
    if (!url) {
      failed.push(f.name);
      continue;
    }
    await prisma.cashBookPhoto.create({ data: { entryId, url, caption, sortOrder: order++ } });
    saved.push(url);
  }

  if (!saved.length) {
    return NextResponse.json(
      { error: "फोटो सेव नहीं हो सकी — uploads फ़ोल्डर जाँचें", failed },
      { status: 500 },
    );
  }

  const photos = await prisma.cashBookPhoto.findMany({
    where: { entryId },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ photos, saved: saved.length, failed });
}

export async function PUT(req: NextRequest) {
  const bad = await guard();
  if (bad) return bad;
  const fd = await req.formData();
  const id = String(fd.get("id") ?? "").trim();
  if (!id) return NextResponse.json({ error: "id चाहिए" }, { status: 400 });
  const photo = await prisma.cashBookPhoto.update({
    where: { id },
    data: { caption: String(fd.get("caption") ?? "").trim() || null },
  });
  return NextResponse.json(photo);
}

export async function DELETE(req: NextRequest) {
  const bad = await guard();
  if (bad) return bad;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id चाहिए" }, { status: 400 });
  await prisma.cashBookPhoto.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
