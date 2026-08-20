import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// ── Simple in-memory rate limiter (per IP) ──────────────────────────────────
// Resets on serverless cold start — sufficient to deter casual brute-force.
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;            // max 5 failures per window

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function checkRateLimit(ip: string): { blocked: boolean; remaining: number } {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 0, resetAt: now + WINDOW_MS });
    return { blocked: false, remaining: MAX_ATTEMPTS };
  }
  return { blocked: entry.count >= MAX_ATTEMPTS, remaining: Math.max(0, MAX_ATTEMPTS - entry.count) };
}

function recordFailure(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function resetAttempts(ip: string) {
  attempts.delete(ip);
}

// Generic "not found or mismatch" — don't reveal which field is wrong
const MISMATCH_ERROR = "दर्ज किया गया विवरण मेल नहीं खाता। सही कोड और मोबाइल नंबर जाँचें।";

// ── POST /api/downloads/verify ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Rate limit check
  const { blocked, remaining } = checkRateLimit(ip);
  if (blocked) {
    return NextResponse.json(
      { error: "बहुत अधिक प्रयास हुए। 15 मिनट बाद पुनः प्रयास करें।" },
      { status: 429, headers: { "Retry-After": "900" } },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "अनुरोध अमान्य है।" }, { status: 400 });
  }

  const { type, code, receiptNumber, mobile, dob } = body as {
    type: string;
    code?: string;
    receiptNumber?: string;
    mobile?: string;
    dob?: string;
  };

  const cleanMobile = (mobile ?? "").replace(/\D/g, "").slice(-10);

  // ── ID CARD or CERTIFICATE ────────────────────────────────────────────────
  if (type === "idcard" || type === "cert") {
    if (!code?.trim() || !cleanMobile || !dob?.trim()) {
      return NextResponse.json(
        { error: "सदस्य कोड, मोबाइल नंबर और जन्म तारीख — तीनों आवश्यक हैं।" },
        { status: 400 },
      );
    }

    const member = await prisma.member.findUnique({
      where: { memberCode: code.trim().toUpperCase() },
    });

    // Don't reveal whether code exists — generic mismatch
    if (!member) {
      recordFailure(ip);
      return NextResponse.json({ error: MISMATCH_ERROR, remaining: remaining - 1 }, { status: 403 });
    }

    const memberMobile = member.mobile.replace(/\D/g, "").slice(-10);
    if (memberMobile !== cleanMobile) {
      recordFailure(ip);
      return NextResponse.json({ error: MISMATCH_ERROR, remaining: remaining - 1 }, { status: 403 });
    }

    // DOB is MANDATORY — must match stored value
    if (!member.dob) {
      // Member has no DOB stored — allow with just mobile (edge case)
      // This shouldn't happen if form requires DOB
    } else {
      const inputDate = new Date(dob).toDateString();
      const storedDate = new Date(member.dob).toDateString();
      if (inputDate !== storedDate) {
        recordFailure(ip);
        return NextResponse.json({ error: MISMATCH_ERROR, remaining: remaining - 1 }, { status: 403 });
      }
    }

    // Membership must be APPROVED
    if (member.status !== "APPROVED") {
      // Don't recordFailure here — credentials are correct
      return NextResponse.json({
        error:
          member.status === "PENDING"
            ? "आपकी सदस्यता अभी अनुमोदन प्रतीक्षित है।"
            : "आपकी सदस्यता सक्रिय नहीं है। संपर्क करें।",
      }, { status: 403 });
    }

    resetAttempts(ip); // Successful → clear failures
    const url = type === "idcard" ? `/id-card/${member.memberCode}` : `/certificate/${member.memberCode}`;
    return NextResponse.json({ ok: true, url, name: member.fullName });
  }

  // ── DONATION RECEIPT ──────────────────────────────────────────────────────
  if (type === "receipt") {
    if (!receiptNumber?.trim()) {
      return NextResponse.json({ error: "रसीद संख्या आवश्यक है।" }, { status: 400 });
    }

    const donation = await prisma.donation.findUnique({
      where: { receiptNumber: receiptNumber.trim().toUpperCase() },
      include: { donor: true },
    });

    if (!donation) {
      recordFailure(ip);
      return NextResponse.json({ error: MISMATCH_ERROR, remaining: remaining - 1 }, { status: 404 });
    }

    if (donation.status === "FAILED" || donation.status === "VOID") {
      return NextResponse.json({ error: "यह दान अस्वीकृत है। रसीद उपलब्ध नहीं है।" }, { status: 403 });
    }

    // If donor mobile is on record → must verify
    const donorMobile = donation.donor?.mobile?.replace(/\D/g, "").slice(-10);
    if (donorMobile) {
      if (!cleanMobile) {
        return NextResponse.json({ error: "मोबाइल नंबर आवश्यक है।" }, { status: 400 });
      }
      if (donorMobile !== cleanMobile) {
        recordFailure(ip);
        return NextResponse.json({ error: MISMATCH_ERROR, remaining: remaining - 1 }, { status: 403 });
      }
    }
    // Anonymous / no mobile stored → receipt number alone is sufficient

    resetAttempts(ip);
    return NextResponse.json({
      ok: true,
      url: `/receipt/${donation.receiptNumber}`,
      name: donation.donor?.isAnonymous ? "गुमनाम दानदाता" : donation.donorName,
    });
  }

  return NextResponse.json({ error: "अमान्य अनुरोध।" }, { status: 400 });
}
