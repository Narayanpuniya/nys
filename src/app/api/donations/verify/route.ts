import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPayment } from "@/lib/payments";
import { generateTxnCode } from "@/lib/sequence";
import { logAudit } from "@/lib/audit";

// STEP 2: Server-side payment verification। कभी सिर्फ frontend पर भरोसा न करें।
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { donationId, orderId, paymentId, signature } = body ?? {};
  if (!donationId || !orderId || !paymentId || !signature) {
    return NextResponse.json({ error: "अधूरी जानकारी" }, { status: 400 });
  }

  const donation = await prisma.donation.findUnique({ where: { id: donationId } });
  if (!donation) return NextResponse.json({ error: "दान रिकॉर्ड नहीं मिला" }, { status: 404 });

  // duplicate confirmation से बचें
  if (donation.status === "SUCCESS") {
    return NextResponse.json({ ok: true, receiptNumber: donation.receiptNumber, already: true });
  }

  const valid = verifyPayment({ orderId, paymentId, signature });
  if (!valid) {
    await prisma.donation.update({ where: { id: donationId }, data: { status: "FAILED" } });
    return NextResponse.json({ error: "भुगतान सत्यापन विफल" }, { status: 400 });
  }

  // सफल: donation update + income entry (financial linkage)
  const updated = await prisma.$transaction(async (tx) => {
    const don = await tx.donation.update({
      where: { id: donationId },
      data: { status: "SUCCESS", gatewayTxnId: paymentId, paidAt: new Date() },
      include: { campaign: true },
    });

    const isCampaign = !!don.campaignId;
    await tx.income.create({
      data: {
        txnCode: await generateTxnCode("INC"),
        source: isCampaign ? "CROWDFUNDING" : "DONATION",
        category: isCampaign ? `अभियान: ${don.campaign?.title ?? ""}` : "सामान्य दान",
        amount: don.amount,
        description: `दान — ${don.donorName} (${don.receiptNumber})`,
        mode: "ONLINE",
        refType: "Donation",
        refId: don.id,
      },
    });

    // campaign target पूरा होने पर status update
    if (don.campaignId && don.campaign) {
      const agg = await tx.donation.aggregate({
        where: { campaignId: don.campaignId, status: "SUCCESS" },
        _sum: { amount: true },
      });
      const collected = agg._sum.amount ?? 0;
      if (collected >= don.campaign.goalAmount && don.campaign.status === "ACTIVE") {
        await tx.campaign.update({ where: { id: don.campaignId }, data: { status: "COMPLETED" } });
      }
    }
    return don;
  });

  await logAudit({
    action: "CREATE",
    entity: "Donation",
    entityId: updated.id,
    summary: `दान सफल: ${updated.donorName} — ₹${updated.amount}`,
  });

  return NextResponse.json({ ok: true, receiptNumber: updated.receiptNumber });
}
