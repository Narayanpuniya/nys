import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_MB = 5;

// POST /api/donations/proof?receipt=DON-2026-xxxxx
// Body: multipart form with "proof" image file
export async function POST(req: NextRequest) {
  try {
    const receipt = req.nextUrl.searchParams.get("receipt");
    if (!receipt) return NextResponse.json({ error: "receipt आवश्यक है।" }, { status: 400 });

    const donation = await prisma.donation.findUnique({ where: { receiptNumber: receipt } });
    if (!donation) return NextResponse.json({ error: "दान रिकॉर्ड नहीं मिला।" }, { status: 404 });
    if (donation.status === "SUCCESS")
      return NextResponse.json({ error: "यह दान पहले से सत्यापित हो चुका है।" }, { status: 400 });

    const form = await req.formData();
    const file = form.get("proof") as File | null;
    if (!file) return NextResponse.json({ error: "फ़ाइल आवश्यक है।" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > MAX_MB * 1024 * 1024)
      return NextResponse.json({ error: `फ़ाइल ${MAX_MB}MB से बड़ी नहीं होनी चाहिए।` }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    if (!["jpg","jpeg","png","webp","pdf"].includes(ext))
      return NextResponse.json({ error: "केवल JPG, PNG, WEBP या PDF अपलोड करें।" }, { status: 400 });

    const dir = path.join(process.cwd(), "public", "uploads", "donation-proofs");
    await mkdir(dir, { recursive: true });
    const filename = `${receipt.replace(/[^a-zA-Z0-9-]/g, "_")}.${ext}`;
    await writeFile(path.join(dir, filename), Buffer.from(bytes));

    const proofUrl = `/uploads/donation-proofs/${filename}`;
    await prisma.donation.update({
      where: { receiptNumber: receipt },
      data: { paymentProofUrl: proofUrl },
    });

    return NextResponse.json({ ok: true, proofUrl });
  } catch (err) {
    console.error("[POST /api/donations/proof]", err);
    return NextResponse.json({ error: "अपलोड विफल।" }, { status: 500 });
  }
}
