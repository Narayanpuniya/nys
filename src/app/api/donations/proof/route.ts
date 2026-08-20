import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { saveReceiptProof } from "@/lib/upload";

// POST /api/donations/proof
// Body: multipart/form-data { donationId, file }
// Saves payment screenshot and stores URL on the donation record.
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const donationId = String(form.get("donationId") ?? "").trim();
    const file = form.get("file") as File | null;

    if (!donationId) {
      return NextResponse.json({ error: "donationId आवश्यक है।" }, { status: 400 });
    }
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "फ़ाइल नहीं मिली।" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "फ़ाइल 5 MB से कम होनी चाहिए।" }, { status: 400 });
    }

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      select: { id: true, status: true },
    });
    if (!donation) {
      return NextResponse.json({ error: "दान नहीं मिला।" }, { status: 404 });
    }
    if (donation.status === "SUCCESS" || donation.status === "FAILED") {
      return NextResponse.json({ error: "इस दान का स्क्रीनशॉट अपडेट नहीं हो सकता।" }, { status: 400 });
    }

    const proofUrl = await saveReceiptProof(file, { maxBytes: 5 * 1024 * 1024 });

    await prisma.donation.update({
      where: { id: donationId },
      data: { proofUrl, status: "PAID" }, // mark as PAID so admin knows payment was made
    });

    return NextResponse.json({ ok: true, proofUrl });
  } catch (err) {
    console.error("[POST /api/donations/proof]", err);
    const msg = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
