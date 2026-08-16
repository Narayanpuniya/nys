import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { donationSchema } from "@/lib/validation";
import { createOrder, isMockMode } from "@/lib/payments";
import { generateDonationReceipt } from "@/lib/sequence";

// STEP 1: दान शुरू करें — PENDING donation + payment order बनाएँ।
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = donationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "अमान्य डेटा", issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const d = parsed.data;

    let campaignId: string | null = null;
    if (d.campaignId) {
      const c = await prisma.campaign.findUnique({ where: { id: d.campaignId } });
      if (!c) return NextResponse.json({ error: "अभियान नहीं मिला" }, { status: 404 });
      if (c.status === "COMPLETED" && !c.acceptAfterGoal) {
        return NextResponse.json({ error: "यह अभियान अब दान स्वीकार नहीं कर रहा" }, { status: 400 });
      }
      campaignId = c.id;
    }

    const receiptNumber = await generateDonationReceipt();
    const order = await createOrder(d.amount, receiptNumber);
    const donorName = d.isAnonymous ? "गुमनाम दानदाता" : d.donorName;

    const donor = await prisma.donor.create({
      data: {
        name: donorName,
        mobile: d.mobile || null,
        email: d.email || null,
        isAnonymous: !!d.isAnonymous,
      },
    });

    const donation = await prisma.donation.create({
      data: {
        receiptNumber,
        donorId: donor.id,
        donorName,
        amount: d.amount,
        purpose: campaignId ? "CAMPAIGN" : d.purpose,
        campaignId,
        mode: "ONLINE",
        status: "PENDING",
        message: d.message || null,
        gatewayOrderId: order.orderId,
      },
    });

    return NextResponse.json({
      donationId: donation.id,
      receiptNumber,
      orderId: order.orderId,
      amount: order.amount,
      mock: isMockMode(),
      razorpayKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || null,
    });
  } catch (err) {
    console.error("[POST /api/donations]", err);
    const detail = err instanceof Error ? err.message : "unknown";
    return NextResponse.json(
      {
        error: detail.includes("Unique constraint")
          ? "रसीद नंबर टकराव — दोबारा प्रयास करें।"
          : `दान शुरू नहीं हो सका। ${detail.slice(0, 160)}`,
      },
      { status: 500 },
    );
  }
}
