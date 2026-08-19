import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createOtp, verifyOtp, otpRemainingMinutes } from "@/lib/otp-store";
import { sendOtpEmail } from "@/lib/mailer";

// ── Emergency Super Admin Password Reset ──────────────────────────────────────
// दो steps:
//   action: "send-otp"     → Secret Key verify → OTP email भेजें
//   action: "verify-reset" → OTP verify → नया पासवर्ड set करें
// ─────────────────────────────────────────────────────────────────────────────

function getResetSecret(): string | null {
  const s = process.env.RESET_SECRET?.trim();
  return s && s.length >= 6 ? s : null;
}

export async function POST(req: NextRequest) {
  const RESET_SECRET = getResetSecret();

  // RESET_SECRET set नहीं है — endpoint बंद
  if (!RESET_SECRET) {
    return NextResponse.json(
      { error: "Emergency reset is disabled. RESET_SECRET not configured in Hostinger." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body?.action) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // ── STEP 1: Secret key verify करो, OTP भेजो ──────────────────────────────
  if (body.action === "send-otp") {
    const { secretKey } = body;

    if (!secretKey || secretKey !== RESET_SECRET) {
      return NextResponse.json(
        { error: "❌ Secret Key गलत है। Hostinger → Environment Variables → RESET_SECRET देखें।" },
        { status: 401 }
      );
    }

    // Gmail config check
    if (!process.env.GMAIL_APP_PASSWORD || !process.env.GMAIL_USER) {
      return NextResponse.json(
        { error: "❌ Email config नहीं है। Hostinger में GMAIL_USER और GMAIL_APP_PASSWORD set करें।" },
        { status: 500 }
      );
    }

    const otp = createOtp();

    try {
      await sendOtpEmail(otp);
    } catch (err) {
      console.error("OTP email error:", err);
      return NextResponse.json(
        { error: "❌ OTP email भेजने में error। Gmail App Password check करें।" },
        { status: 500 }
      );
    }

    const maskedEmail = process.env.GMAIL_USER.replace(/(.{2}).+(@.+)/, "$1****$2");
    return NextResponse.json({
      ok: true,
      message: `✅ OTP भेज दिया गया: ${maskedEmail} पर। 10 मिनट में enter करें।`,
    });
  }

  // ── STEP 2: OTP + नया पासवर्ड verify करो ────────────────────────────────
  if (body.action === "verify-reset") {
    const { secretKey, otp, newPassword, confirmPassword } = body;

    // Secret key दोबारा check
    if (!secretKey || secretKey !== RESET_SECRET) {
      return NextResponse.json(
        { error: "❌ Secret Key गलत है।" },
        { status: 401 }
      );
    }

    // Password validation
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "❌ पासवर्ड कम से कम 6 अक्षर का होना चाहिए।" },
        { status: 400 }
      );
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "❌ दोनों पासवर्ड एक जैसे नहीं हैं।" },
        { status: 400 }
      );
    }

    // OTP verify
    const otpResult = verifyOtp(otp?.toString().trim());
    if (otpResult === "expired") {
      return NextResponse.json(
        { error: "❌ OTP expire हो गया। वापस जाएं और नया OTP मँगाएं।" },
        { status: 400 }
      );
    }
    if (otpResult === "too_many") {
      return NextResponse.json(
        { error: "❌ बहुत बार गलत OTP। वापस जाएं और नया OTP मँगाएं।" },
        { status: 400 }
      );
    }
    if (otpResult === "wrong") {
      const rem = otpRemainingMinutes();
      return NextResponse.json(
        { error: `❌ OTP गलत है। ${rem} मिनट बाकी हैं।` },
        { status: 400 }
      );
    }

    // OTP सही — SUPER_ADMIN ढूँढो और पासवर्ड update करो
    const superAdmin = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" },
      orderBy: { createdAt: "asc" },
    });

    if (!superAdmin) {
      return NextResponse.json(
        { error: "❌ कोई Super Admin नहीं मिला।" },
        { status: 404 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: superAdmin.id },
      data: { passwordHash, isActive: true },
    });

    return NextResponse.json({
      ok: true,
      message: `✅ पासवर्ड reset हो गया!`,
      name: superAdmin.name,
      email: superAdmin.email,
    });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
