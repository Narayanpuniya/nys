import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/upload";

export async function POST(req: NextRequest) {
  if (!await getSessionUser()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const photo = form.get("photo");
  let photoUrl: string | null = null;
  if (photo instanceof File && photo.size > 0) {
    photoUrl = await saveUploadedImage(photo, "members", { maxBytes: 2 * 1024 * 1024 });
  } else {
    // URL string (e.g., from member's existing photoUrl)
    const urlVal = String(form.get("photoUrl") ?? "").trim();
    if (urlVal) photoUrl = urlVal;
  }

  const memberId = String(form.get("memberId") ?? "").trim() || null;

  const mentor = await prisma.mentor.create({
    data: {
      name:         String(form.get("name") ?? "").trim(),
      designation:  String(form.get("designation") ?? "").trim() || null,
      profession:   String(form.get("profession") ?? "").trim() || null,
      intro:        String(form.get("intro") ?? "").trim() || null,
      contribution: String(form.get("contribution") ?? "").trim() || null,
      contact:      String(form.get("contact") ?? "").trim() || null,
      featured:     form.get("featured") === "true",
      showContact:  form.get("showContact") === "true",
      sortOrder:    parseInt(String(form.get("sortOrder") ?? "0")) || 0,
      photoUrl,
      memberId,
    },
  });
  return NextResponse.json(mentor);
}

export async function PATCH(req: NextRequest) {
  if (!await getSessionUser()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const id = String(form.get("id") ?? "");
  if (!id) return NextResponse.json({ error: "id आवश्यक" }, { status: 400 });

  const photo = form.get("photo");
  let photoUrl: string | undefined = undefined;
  if (photo instanceof File && photo.size > 0) {
    photoUrl = (await saveUploadedImage(photo, "members", { maxBytes: 2 * 1024 * 1024 })) ?? undefined;
  }

  const memberId = String(form.get("memberId") ?? "").trim() || null;

  const updated = await prisma.mentor.update({
    where: { id },
    data: {
      name:         String(form.get("name") ?? "").trim(),
      designation:  String(form.get("designation") ?? "").trim() || null,
      profession:   String(form.get("profession") ?? "").trim() || null,
      intro:        String(form.get("intro") ?? "").trim() || null,
      contribution: String(form.get("contribution") ?? "").trim() || null,
      contact:      String(form.get("contact") ?? "").trim() || null,
      featured:     form.get("featured") === "true",
      showContact:  form.get("showContact") === "true",
      sortOrder:    parseInt(String(form.get("sortOrder") ?? "0")) || 0,
      memberId,
      ...(photoUrl !== undefined ? { photoUrl } : {}),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  if (!await getSessionUser()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.mentor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
