import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPayment } from "@/lib/payments";
import { generateMembershipReceipt, generateCertNumber, generateTxnCode } from "@/lib/sequence";
import { getSettings } from "@/lib/settings";
import { logAudit } from "@/lib/audit";

// STEP 2: Membership payment verification (server-side)।
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { memberId, orderId, paymentId, signature } = body ?? {};
    if (!memberId || !orderId || !paymentId || !signature) {
      return NextResponse.json({ error: "अधूरी जानकारी" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({ where: { id: memberId }, include: { plan: true } });
    if (!member || !member.plan) {
      return NextResponse.json({ error: "सदस्य रिकॉर्ड नहीं मिला" }, { status: 404 });
    }

    const existingPaid = await prisma.membershipPayment.findFirst({
      where: { memberId, status: "SUCCESS", gatewayTxnId: paymentId },
    });
    if (existingPaid) {
      return NextResponse.json({
        ok: true,
        memberCode: member.memberCode,
        already: true,
        status: member.status,
      });
    }

    const valid = verifyPayment({ orderId, paymentId, signature });
    if (!valid) return NextResponse.json({ error: "भुगतान सत्यापन विफल" }, { status: 400 });

    const settings = await getSettings();
    const now = new Date();
    const periodEnd = new Date(now.getTime() + member.plan.periodDays * 86400000);

    // Sequences पहले (बाहर) — nested interactive transactions से बचें
    const receiptNumber = await generateMembershipReceipt(settings.membershipReceiptPrefix);
    const txnCode = await generateTxnCode("INC");
    const autoApprove = settings.membershipAutoApprove;
    const certNumber = autoApprove ? await generateCertNumber(settings.certPrefix) : null;

    await prisma.$transaction([
      prisma.membershipPayment.create({
        data: {
          receiptNumber,
          memberId,
          planId: member.planId,
          amount: member.plan.amount,
          periodStart: now,
          periodEnd,
          mode: "ONLINE",
          gatewayTxnId: paymentId,
          status: "SUCCESS",
        },
      }),
      prisma.income.create({
        data: {
          txnCode,
          source: "MEMBERSHIP",
          category: member.plan.name,
          amount: member.plan.amount,
          description: `सदस्यता शुल्क — ${member.fullName} (${member.memberCode})`,
          mode: "ONLINE",
          refType: "MembershipPayment",
          refId: memberId,
        },
      }),
      prisma.member.update({
        where: { id: memberId },
        data: autoApprove
          ? { status: "ACTIVE", validUntil: periodEnd }
          : { validUntil: periodEnd },
      }),
      ...(certNumber
        ? [
            prisma.certificate.create({
              data: { certNumber, memberId, type: "MEMBERSHIP" },
            }),
          ]
        : []),
    ]);

    await logAudit({
      action: "CREATE",
      entity: "Member",
      entityId: memberId,
      summary: `सदस्यता भुगतान सफल: ${member.fullName} (${member.memberCode})`,
    });

    return NextResponse.json({
      ok: true,
      memberCode: member.memberCode,
      receiptNumber,
      status: autoApprove ? "ACTIVE" : "PENDING",
      approved: autoApprove,
    });
  } catch (err) {
    console.error("[POST /api/members/verify]", err);
    return NextResponse.json(
      { error: "भुगतान सत्यापन में सर्वर त्रुटि। Database URL जाँचें।" },
      { status: 500 },
    );
  }
}
