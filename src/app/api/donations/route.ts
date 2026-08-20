import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { donationSchema } from "@/lib/validation";
import { generateDonationReceipt } from "@/lib/sequence";

// POST /api/donations
// UPI/Bank-transfer flow: create PENDING donation, admin verifies later.
// No Razorpay — payment happens externally (UPI QR scan / bank transfer).
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
        mode: d.mobile ? "UPI" : "BANK_TRANSFER",
        status: "PENDING",
        message: d.message || null,
      },
    });

    return NextResponse.json({ ok: true, donationId: donation.id, receiptNumber });
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
