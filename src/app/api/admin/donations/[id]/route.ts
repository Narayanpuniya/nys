import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { can, PERMISSIONS } from "@/lib/constants";
import { logAudit } from "@/lib/audit";

// GET /api/admin/donations/[id] — fetch donation details for edit modal
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || !can(user.role, PERMISSIONS.DONATIONS_MANAGE))
    return NextResponse.json({ error: "अनुमति नहीं है।" }, { status: 403 });

  const { id } = await params;
  const donation = await prisma.donation.findUnique({
    where: { id },
    include: { campaign: true, donor: true },
  });
  if (!donation) return NextResponse.json({ error: "दान नहीं मिला।" }, { status: 404 });

  return NextResponse.json({ donation });
}

// PUT /api/admin/donations/[id] — update donation fields before approval
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || !can(user.role, PERMISSIONS.DONATIONS_MANAGE))
    return NextResponse.json({ error: "अनुमति नहीं है।" }, { status: 403 });

  const { id } = await params;
  const donation = await prisma.donation.findUnique({ where: { id } });
  if (!donation) return NextResponse.json({ error: "दान नहीं मिला।" }, { status: 404 });

  if (donation.status === "SUCCESS")
    return NextResponse.json({ error: "स्वीकृत दान संपादित नहीं किया जा सकता।" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const { donorName, amount, message, purpose } = body ?? {};

  const amountInt = amount ? parseInt(String(amount), 10) : undefined;
  if (amountInt !== undefined && (isNaN(amountInt) || amountInt < 1))
    return NextResponse.json({ error: "राशि अमान्य है।" }, { status: 400 });

  const updated = await prisma.donation.update({
    where: { id },
    data: {
      ...(donorName?.trim() ? { donorName: donorName.trim() } : {}),
      ...(amountInt          ? { amount: amountInt }            : {}),
      ...(message !== undefined ? { message }                   : {}),
      ...(purpose?.trim()   ? { purpose: purpose.trim() }      : {}),
    },
  });

  await logAudit({
    action: "UPDATE",
    entity: "Donation",
    entityId: id,
    summary: `दान संपादित: ${updated.receiptNumber} — ₹${updated.amount} (${user.name})`,
  });

  return NextResponse.json({ ok: true, donation: updated });
}

// DELETE /api/admin/donations/[id]
// PENDING/PAID/FAILED → hard delete (no financial impact)
// SUCCESS → VOID (income entry exists, just mark cancelled)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || !can(user.role, PERMISSIONS.DONATIONS_MANAGE))
    return NextResponse.json({ error: "अनुमति नहीं है।" }, { status: 403 });

  const { id } = await params;
  const donation = await prisma.donation.findUnique({ where: { id } });
  if (!donation) return NextResponse.json({ error: "दान नहीं मिला।" }, { status: 404 });

  // For SUCCESS: also delete linked income entry, then hard delete
  if (donation.status === "SUCCESS") {
    await prisma.income.deleteMany({
      where: { refType: "Donation", refId: donation.id },
    });
  }

  // Hard delete (all statuses)
  await prisma.donation.delete({ where: { id } });

  // Clean up orphan donor if no other donations remain
  if (donation.donorId) {
    const otherDonations = await prisma.donation.count({ where: { donorId: donation.donorId } });
    if (otherDonations === 0) {
      await prisma.donor.delete({ where: { id: donation.donorId } }).catch(() => {});
    }
  }

  await logAudit({
    action: "DELETE",
    entity: "Donation",
    entityId: id,
    summary: `दान हटाया: ${donation.receiptNumber} — ₹${donation.amount} [${donation.status}] (${user.name})`,
  });
  return NextResponse.json({ ok: true, deleted: true });
}
