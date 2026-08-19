import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/upload";

function slugify(name: string) {
  return name.trim().toLowerCase()
    .replace(/[\s]+/g, "-")
    .replace(/[^\w-]/g, "")
    .slice(0, 60) + "-" + Date.now().toString(36);
}

// ── POST: नया सहयोगी संस्थान ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!await getSessionUser()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const logo = form.get("logo");
  let logoUrl: string | null = null;
  if (logo instanceof File && logo.size > 0)
    logoUrl = await saveUploadedImage(logo, "logo", { maxBytes: 2 * 1024 * 1024 });

  const name = String(form.get("name") ?? "").trim();
  if (!name) return NextResponse.json({ error: "नाम आवश्यक है" }, { status: 400 });

  // programs JSON
  let programs: { title: string; impactLabel?: string; impactValue?: number }[] = [];
  try { programs = JSON.parse(String(form.get("programs") ?? "[]")); } catch {}

  const partner = await prisma.partner.create({
    data: {
      slug:         slugify(name),
      name,
      about:        String(form.get("about") ?? "").trim() || null,
      website:      String(form.get("website") ?? "").trim() || null,
      socialLinks:  String(form.get("socialLinks") ?? "").trim() || null,
      contribution: String(form.get("contribution") ?? "").trim() || null,
      featured:     form.get("featured") === "true",
      logoUrl,
      programs: { create: programs.filter(p => p.title?.trim()).map(p => ({
        title: p.title.trim(),
        impactLabel: p.impactLabel?.trim() || null,
        impactValue: p.impactValue ?? null,
      })) },
    },
    include: { programs: true },
  });
  return NextResponse.json(partner);
}

// ── PATCH: संपादित करें ─────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  if (!await getSessionUser()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const id = String(form.get("id") ?? "");
  if (!id) return NextResponse.json({ error: "id आवश्यक" }, { status: 400 });

  const logo = form.get("logo");
  let logoUrl: string | undefined = undefined;
  if (logo instanceof File && logo.size > 0)
    logoUrl = (await saveUploadedImage(logo, "logo", { maxBytes: 2 * 1024 * 1024 })) ?? undefined;

  let programs: { title: string; impactLabel?: string; impactValue?: number }[] = [];
  try { programs = JSON.parse(String(form.get("programs") ?? "[]")); } catch {}

  // programs: delete all old + recreate
  await prisma.partnerProgram.deleteMany({ where: { partnerId: id } });

  const updated = await prisma.partner.update({
    where: { id },
    data: {
      name:         String(form.get("name") ?? "").trim(),
      about:        String(form.get("about") ?? "").trim() || null,
      website:      String(form.get("website") ?? "").trim() || null,
      socialLinks:  String(form.get("socialLinks") ?? "").trim() || null,
      contribution: String(form.get("contribution") ?? "").trim() || null,
      featured:     form.get("featured") === "true",
      ...(logoUrl !== undefined ? { logoUrl } : {}),
      programs: { create: programs.filter(p => p.title?.trim()).map(p => ({
        title: p.title.trim(),
        impactLabel: p.impactLabel?.trim() || null,
        impactValue: p.impactValue ?? null,
      })) },
    },
    include: { programs: true },
  });
  return NextResponse.json(updated);
}

// ── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  if (!await getSessionUser()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.partner.delete({ where: { id } }); // programs cascade
  return NextResponse.json({ ok: true });
}
