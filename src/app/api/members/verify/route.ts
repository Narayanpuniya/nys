import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPayment } from "@/lib/payments";
import { generateMembershipReceipt, generateCertNumber, generateTxnCode } from "@/lib/sequence";
import { getSettings } from "@/lib/settings";
import { logAudit } from "@/lib/audit";

// STEP 2: Membership payment verification (server-side)।
// सफल: MembershipPayment + Income + (auto-approve पर) ACTIVE + Certificate।
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { memberId, orderId, paymentId, signature } = body ?? {};
  if (!memberId || !orderId || !paymentId || !signature) {
    return NextResponse.json({ error: "अधूरी जानकारी" }, { status: 400 });
  }

  const member = await prisma.member.findUnique({ where: { id: memberId }, include: { plan: true } });
  if (!member || !member.plan) return NextResponse.json({ error: "सदस्य रिकॉर्ड नहीं मिला" }, { status: 404 });

  // duplicate भुगतान रोकें
  const existingPaid = await prisma.membershipPayment.findFirst({
    where: { memberId, status: "SUCCESS", gatewayTxnId: paymentId },
  });
  if (existingPaid) {
    return NextResponse.json({ ok: true, memberCode: member.memberCode, already: true, status: member.status });
  }

  const valid = verifyPayment({ orderId, paymentId, signature });
  if (!valid) return NextResponse.json({ error: "भुगतान सत्यापन विफल" }, { status: 400 });

  const settings = await getSettings();
  const now = new Date();
  const periodEnd = new Date(now.getTime() + member.plan.periodDays * 86400000);

  const result = await prisma.$transaction(async (tx) => {
    const receiptNumber = await generateMembershipReceipt(settings.membershipReceiptPrefix);
    await tx.membershipPayment.create({
      data: {
        receiptNumber, memberId, planId: member.planId, amount: member.plan!.amount,
        periodStart: now, periodEnd, mode: "ONLINE", gatewayTxnId: paymentId, status: "SUCCESS",
      },
    });
    await tx.income.create({
      data: {
        txnCode: await generateTxnCode("INC"), source: "MEMBERSHIP", category: member.plan!.name,
        amount: member.plan!.amount, description: `सदस्यता शुल्क — ${member.fullName} (${member.memberCode})`,
        mode: "ONLINE", refType: "MembershipPayment", refId: memberId,
      },
    });

    const autoApprove = settings.membershipAutoApprove;
    let certNumber: string | null = null;
    if (autoApprove) {
      await tx.member.update({
        where: { id: memberId },
        data: { status: "ACTIVE", validUntil: periodEnd },
      });
      certNumber = await generateCertNumber(settings.certPrefix);
      await tx.certificate.create({ data: { certNumber, memberId, type: "MEMBERSHIP" } });
    } else {
      // manual approval: payment हो गया पर status PENDING (awaiting approval)
      await tx.member.update({ where: { id: memberId }, data: { validUntil: periodEnd } });
    }

    return { receiptNumber, certNumber, autoApprove };
  });

  await logAudit({
    action: "CREATE", entity: "Member", entityId: memberId,
    summary: `सदस्यता भुगतान सफल: ${member.fullName} (${member.memberCode})`,
  });

  return NextResponse.json({
    ok: true,
    memberCode: member.memberCode,
    receiptNumber: result.receiptNumber,
    status: result.autoApprove ? "ACTIVE" : "PENDING",
    approved: result.autoApprove,
  });
}
