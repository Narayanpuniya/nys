import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/upload";

// ── POST: टीम सदस्य जोड़ें ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!await getSessionUser()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const photo = form.get("photo");
  let photoUrl: string | null = null;
  if (photo instanceof File && photo.size > 0) {
    photoUrl = await saveUploadedImage(photo, "members", { maxBytes: 2 * 1024 * 1024 });
  }

  const memberId = String(form.get("memberId") ?? "").trim() || null;

  const member = await prisma.teamMember.create({
    data: {
      name:           String(form.get("name") ?? "").trim(),
      designation:    String(form.get("designation") ?? "").trim(),
      designationKey: String(form.get("designationKey") ?? "MEMBER").trim(),
      mobile:         String(form.get("mobile") ?? "").trim() || null,
      bio:            String(form.get("bio") ?? "").trim() || null,
      responsibility: String(form.get("responsibility") ?? "").trim() || null,
      isLeadership:   form.get("isLeadership") === "true",
      showMobile:     form.get("showMobile") === "true",
      sortOrder:      parseInt(String(form.get("sortOrder") ?? "0")) || 0,
      photoUrl,
      memberId,
    },
  });
  return NextResponse.json(member);
}

// ── PATCH: संपादित करें ─────────────────────────────────────────────────────
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

  const updated = await prisma.teamMember.update({
    where: { id },
    data: {
      name:           String(form.get("name") ?? "").trim(),
      designation:    String(form.get("designation") ?? "").trim(),
      designationKey: String(form.get("designationKey") ?? "MEMBER").trim(),
      mobile:         String(form.get("mobile") ?? "").trim() || null,
      bio:            String(form.get("bio") ?? "").trim() || null,
      responsibility: String(form.get("responsibility") ?? "").trim() || null,
      isLeadership:   form.get("isLeadership") === "true",
      showMobile:     form.get("showMobile") === "true",
      sortOrder:      parseInt(String(form.get("sortOrder") ?? "0")) || 0,
      memberId,
      ...(photoUrl !== undefined ? { photoUrl } : {}),
    },
  });
  return NextResponse.json(updated);
}

// ── DELETE: हटाएँ ────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  if (!await getSessionUser()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.teamMember.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
