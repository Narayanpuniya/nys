import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { can, PERMISSIONS } from "@/lib/constants";

async function requireAuth() {
  const user = await getSessionUser();
  if (!user || !can(user.role, PERMISSIONS.DONATIONS_MANAGE))
    return NextResponse.json({ error: "अनुमति नहीं है।" }, { status: 403 });
  return user;
}

function genReceipt(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rnd = String(Math.floor(1000 + Math.random() * 9000));
  return `DNT-${ymd}-${rnd}`;
}

// ── POST: नया दान जोड़ें ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const me = await requireAuth();
  if (me instanceof NextResponse) return me;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { donorName, mobile, amount, purpose, mode, status, paidAt, message, campaignId } = body;

  if (!donorName?.trim())
    return NextResponse.json({ error: "❌ दानदाता का नाम आवश्यक है।" }, { status: 400 });

  const amt = parseInt(amount, 10);
  if (!amt || amt <= 0)
    return NextResponse.json({ error: "❌ सही राशि डालें।" }, { status: 400 });

  // Donor बनाएं या ढूँढें (mobile से)
  let donorId: string | null = null;
  if (mobile?.trim()) {
    const existing = await prisma.donor.findFirst({ where: { mobile: mobile.trim() } });
    if (existing) {
      donorId = existing.id;
    } else {
      const d = await prisma.donor.create({
        data: { name: donorName.trim(), mobile: mobile.trim() },
      });
      donorId = d.id;
    }
  }

  // Unique receipt number generate करो
  let receiptNumber = genReceipt();
  let tries = 0;
  while (await prisma.donation.findUnique({ where: { receiptNumber } }) && tries < 5) {
    receiptNumber = genReceipt();
    tries++;
  }

  const donation = await prisma.donation.create({
    data: {
      receiptNumber,
      donorId,
      donorName:  donorName.trim(),
      amount:     amt,
      purpose:    purpose?.trim() || "GENERAL",
      mode:       mode || "CASH",
      status:     status || "SUCCESS",
      paidAt:     status === "SUCCESS" ? (paidAt ? new Date(paidAt) : new Date()) : null,
      message:    message?.trim() || null,
      campaignId: campaignId || null,
    },
  });

  return NextResponse.json({ ok: true, receiptNumber: donation.receiptNumber });
}

// ── DELETE: दान हटाएं ────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const me = await requireAuth();
  if (me instanceof NextResponse) return me;

  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id आवश्यक है।" }, { status: 400 });

  await prisma.donation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
