import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { can, PERMISSIONS } from "@/lib/constants";
import { generateTxnCode } from "@/lib/sequence";
import { logAudit } from "@/lib/audit";

// POST /api/admin/donations/verify
// Body: { id, action: "approve" | "reject", note?: string }
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !can(user.role, PERMISSIONS.DONATIONS_MANAGE))
    return NextResponse.json({ error: "अनुमति नहीं है।" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const { id, action, note } = body ?? {};

  if (!id || !["approve", "reject"].includes(action))
    return NextResponse.json({ error: "id और action (approve/reject) आवश्यक हैं।" }, { status: 400 });

  const donation = await prisma.donation.findUnique({ where: { id }, include: { campaign: true } });
  if (!donation) return NextResponse.json({ error: "दान नहीं मिला।" }, { status: 404 });
  if (donation.status === "SUCCESS")
    return NextResponse.json({ error: "यह दान पहले से सत्यापित है।" }, { status: 400 });

  if (action === "reject") {
    await prisma.donation.update({
      where: { id },
      data: {
        status: "FAILED",
        message: note ? `[Admin] ${note}` : undefined,
      },
    });
    await logAudit({
      action: "UPDATE",
      entity: "Donation",
      entityId: id,
      summary: `दान अस्वीकृत: ${donation.donorName} — ₹${donation.amount}`,
    });
    return NextResponse.json({ ok: true, status: "FAILED" });
  }

  // ── APPROVE ──────────────────────────────────────────────────────────────
  const txnCode = await generateTxnCode("INC");
  const isCampaign = !!donation.campaignId;

  await prisma.donation.update({
    where: { id },
    data: {
      status: "SUCCESS",
      paidAt: donation.paidAt ?? new Date(),
    },
  });

  // Income entry बनाएँ (अब admin approval पर)
  await prisma.income.create({
    data: {
      txnCode,
      source: isCampaign ? "CROWDFUNDING" : "DONATION",
      category: isCampaign ? `अभियान: ${donation.campaign?.title ?? ""}` : "सामान्य दान",
      amount: donation.amount,
      description: `दान — ${donation.donorName} (${donation.receiptNumber})`,
      mode: donation.mode || "ONLINE",
      refType: "Donation",
      refId: donation.id,
    },
  });

  // Campaign completion check
  if (donation.campaignId && donation.campaign) {
    const agg = await prisma.donation.aggregate({
      where: { campaignId: donation.campaignId, status: "SUCCESS" },
      _sum: { amount: true },
    });
    const collected = agg._sum.amount ?? 0;
    if (collected >= donation.campaign.goalAmount && donation.campaign.status === "ACTIVE") {
      await prisma.campaign.update({
        where: { id: donation.campaignId },
        data: { status: "COMPLETED" },
      });
    }
  }

  await logAudit({
    action: "UPDATE",
    entity: "Donation",
    entityId: id,
    summary: `दान सत्यापित: ${donation.donorName} — ₹${donation.amount} (${user.name})`,
  });

  return NextResponse.json({ ok: true, status: "SUCCESS", receiptNumber: donation.receiptNumber });
}
