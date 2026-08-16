import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPayment } from "@/lib/payments";
import { generateTxnCode } from "@/lib/sequence";
import { logAudit } from "@/lib/audit";

// STEP 2: Server-side payment verification।
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { donationId, orderId, paymentId, signature } = body ?? {};
    if (!donationId || !orderId || !paymentId || !signature) {
      return NextResponse.json({ error: "अधूरी जानकारी" }, { status: 400 });
    }

    const donation = await prisma.donation.findUnique({ where: { id: donationId } });
    if (!donation) return NextResponse.json({ error: "दान रिकॉर्ड नहीं मिला" }, { status: 404 });

    if (donation.status === "SUCCESS") {
      return NextResponse.json({ ok: true, receiptNumber: donation.receiptNumber, already: true });
    }

    const valid = verifyPayment({ orderId, paymentId, signature });
    if (!valid) {
      await prisma.donation.update({ where: { id: donationId }, data: { status: "FAILED" } });
      return NextResponse.json({ error: "भुगतान सत्यापन विफल" }, { status: 400 });
    }

    const txnCode = await generateTxnCode("INC");
    const isCampaign = !!donation.campaignId;

    const updated = await prisma.donation.update({
      where: { id: donationId },
      data: { status: "SUCCESS", gatewayTxnId: paymentId, paidAt: new Date() },
      include: { campaign: true },
    });

    await prisma.income.create({
      data: {
        txnCode,
        source: isCampaign ? "CROWDFUNDING" : "DONATION",
        category: isCampaign ? `अभियान: ${updated.campaign?.title ?? ""}` : "सामान्य दान",
        amount: updated.amount,
        description: `दान — ${updated.donorName} (${updated.receiptNumber})`,
        mode: "ONLINE",
        refType: "Donation",
        refId: updated.id,
      },
    });

    if (updated.campaignId && updated.campaign) {
      const agg = await prisma.donation.aggregate({
        where: { campaignId: updated.campaignId, status: "SUCCESS" },
        _sum: { amount: true },
      });
      const collected = agg._sum.amount ?? 0;
      if (collected >= updated.campaign.goalAmount && updated.campaign.status === "ACTIVE") {
        await prisma.campaign.update({
          where: { id: updated.campaignId },
          data: { status: "COMPLETED" },
        });
      }
    }

    await logAudit({
      action: "CREATE",
      entity: "Donation",
      entityId: updated.id,
      summary: `दान सफल: ${updated.donorName} — ₹${updated.amount}`,
    });

    return NextResponse.json({ ok: true, receiptNumber: updated.receiptNumber });
  } catch (err) {
    console.error("[POST /api/donations/verify]", err);
    const detail = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: `भुगतान सत्यापन त्रुटि। ${detail.slice(0, 160)}` },
      { status: 500 },
    );
  }
}
