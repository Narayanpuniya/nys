import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPayment } from "@/lib/payments";
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

    // Payment gateway verified — set PAID (awaiting admin approval, not SUCCESS yet)
    const updated = await prisma.donation.update({
      where: { id: donationId },
      data: { status: "PAID", gatewayTxnId: paymentId, paidAt: new Date() },
    });

    await logAudit({
      action: "CREATE",
      entity: "Donation",
      entityId: updated.id,
      summary: `भुगतान प्राप्त (सत्यापन लंबित): ${updated.donorName} — ₹${updated.amount}`,
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
