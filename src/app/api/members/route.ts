import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { memberSchema } from "@/lib/validation";
import { createOrder, isMockMode } from "@/lib/payments";
import { generateMemberCode } from "@/lib/sequence";
import { getSettings } from "@/lib/settings";

// STEP 1: सदस्य पंजीकरण — PENDING member + membership payment order।
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = memberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "अमान्य डेटा", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const d = parsed.data;

  const plan = await prisma.membershipPlan.findUnique({ where: { id: d.planId } });
  if (!plan || !plan.isActive) return NextResponse.json({ error: "सदस्यता योजना अमान्य" }, { status: 400 });

  const settings = await getSettings();
  const memberCode = await generateMemberCode(settings.memberIdPrefix);

  const member = await prisma.member.create({
    data: {
      memberCode,
      fullName: d.fullName,
      guardianName: d.guardianName || null,
      dob: d.dob ? new Date(d.dob) : null,
      gender: d.gender || null,
      mobile: d.mobile,
      whatsapp: d.whatsapp || null,
      email: d.email || null,
      address: d.address || null,
      village: d.village || null,
      district: d.district || null,
      state: d.state || "Rajasthan",
      occupation: d.occupation || null,
      bloodGroup: d.bloodGroup || null,
      photoUrl: d.photoUrl || null,
      emergencyContact: d.emergencyContact || null,
      planId: plan.id,
      status: "PENDING",
      consent: true,
      showMobile: settings.privacy.showMemberMobileDefault,
    },
  });

  const order = await createOrder(plan.amount, `MEMBER-${memberCode}`);

  return NextResponse.json({
    memberId: member.id,
    memberCode,
    planName: plan.name,
    amount: plan.amount,
    orderId: order.orderId,
    mock: isMockMode(),
    razorpayKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || null,
  });
}
