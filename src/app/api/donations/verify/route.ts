import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPayment } from "@/lib/payments";
import { logAudit } from "@/lib/audit";
import { generateTxnCode } from "@/lib/sequence";

// STEP 2: Razorpay signature verification + auto-approve.
// Razorpay signature सफल → status = SUCCESS + income entry auto-created → receipt तुरंत जारी।
// Manual/Bank-transfer donations PENDING रहते हैं → admin approval चाहिए।
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { donationId, orderId, paymentId, signature } = body ?? {};
    if (!donationId || !orderId || !paymentId || !signature) {
      return NextResponse.json({ error: "अधूरी जानकारी" }, { status: 400 });
    }

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: { campaign: true },
    });
    if (!donation) return NextResponse.json({ error: "दान रिकॉर्ड नहीं मिला" }, { status: 404 });

    // Already processed
    if (donation.status === "SUCCESS") {
      return NextResponse.json({ ok: true, receiptNumber: donation.receiptNumber, already: true });
    }

    // ── Razorpay signature verification ──────────────────────────────────────
    const valid = verifyPayment({ orderId, paymentId, signature });
    if (!valid) {
      await prisma.donation.update({
        where: { id: donationId },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ error: "भुगतान सत्यापन विफल" }, { status: 400 });
    }

    // ── Auto-approve: Razorpay verified → SUCCESS directly ───────────────────
    const now = new Date();
    const txnCode = await generateTxnCode("INC");
    const isCampaign = !!donation.campaignId;

    // Update donation to SUCCESS in one transaction
    const [updated] = await prisma.$transaction([
      prisma.donation.update({
        where: { id: donationId },
        data: {
          status: "SUCCESS",
          gatewayTxnId: paymentId,
          gatewayOrderId: orderId,
          paidAt: now,
        },
      }),
      prisma.income.create({
        data: {
          txnCode,
          source: isCampaign ? "CROWDFUNDING" : "DONATION",
          category: isCampaign
            ? `अभियान: ${donation.campaign?.title ?? ""}`
            : "सामान्य दान",
          amount: donation.amount,
          description: `दान — ${donation.donorName} (${donation.receiptNumber}) [UPI/Online auto-verified]`,
          mode: "ONLINE",
          refType: "Donation",
          refId: donation.id,
        },
      }),
    ]);

    // Campaign completion check
    if (donation.campaignId && donation.campaign) {
      const agg = await prisma.donation.aggregate({
        where: { campaignId: donation.campaignId, status: "SUCCESS" },
        _sum: { amount: true },
      });
      const collected = (agg._sum.amount ?? 0) + donation.amount;
      if (collected >= donation.campaign.goalAmount && donation.campaign.status === "ACTIVE") {
        await prisma.campaign.update({
          where: { id: donation.campaignId },
          data: { status: "COMPLETED" },
        });
      }
    }

    await logAudit({
      action: "CREATE",
      entity: "Donation",
      entityId: donation.id,
      summary: `दान स्वीकृत (Auto, Razorpay): ${donation.donorName} — ₹${donation.amount} | ${donation.receiptNumber}`,
    });

    return NextResponse.json({ ok: true, receiptNumber: donation.receiptNumber });
  } catch (err) {
    console.error("[POST /api/donations/verify]", err);
    const detail = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      { error: `भुगतान सत्यापन त्रुटि। ${detail.slice(0, 160)}` },
      { status: 500 },
    );
  }
}
