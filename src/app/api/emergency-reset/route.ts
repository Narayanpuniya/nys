import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createOtp, verifyOtp, otpRemainingMinutes, ADMIN_OTP_KEY } from "@/lib/otp-store";
import { sendOtpEmail } from "@/lib/mailer";

// ── Emergency Super Admin Password Reset ──────────────────────────────────────
// तीन actions — दोनों में से कोई भी एक काफी है:
//
//   "send-otp"         → Gmail पर OTP भेजो (कोई secret key नहीं चाहिए)
//   "reset-with-otp"   → OTP verify करो + नया password set करो
//   "reset-with-secret"→ Secret Key से directly password reset करो
// ─────────────────────────────────────────────────────────────────────────────

async function getSuperAdmin() {
  return prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
    orderBy: { createdAt: "asc" },
  });
}

async function setNewPassword(id: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.update({
    where: { id },
    data: { passwordHash, isActive: true },
  });
}

function validatePassword(newPassword: string, confirmPassword: string) {
  if (!newPassword || newPassword.length < 6)
    return "❌ पासवर्ड कम से कम 6 अक्षर का होना चाहिए।";
  if (newPassword !== confirmPassword)
    return "❌ दोनों पासवर्ड एक जैसे नहीं हैं।";
  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.action)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  // ── Method A: OTP भेजो ──────────────────────────────────────────────────
  if (body.action === "send-otp") {
    if (!process.env.GMAIL_APP_PASSWORD || !process.env.GMAIL_USER) {
      return NextResponse.json(
        { error: "❌ Email config नहीं है। Hostinger में GMAIL_USER और GMAIL_APP_PASSWORD set करें।" },
        { status: 500 }
      );
    }

    const otp = createOtp(ADMIN_OTP_KEY);
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
      message: `✅ OTP ${maskedEmail} पर भेज दिया। 10 मिनट में enter करें।`,
    });
  }

  // ── Method A: OTP verify करो + Password reset ────────────────────────────
  if (body.action === "reset-with-otp") {
    const { otp, newPassword, confirmPassword } = body;

    const pwErr = validatePassword(newPassword, confirmPassword);
    if (pwErr) return NextResponse.json({ error: pwErr }, { status: 400 });

    const otpResult = verifyOtp(ADMIN_OTP_KEY, otp?.toString().trim() ?? "");
    if (otpResult === "expired")
      return NextResponse.json({ error: "❌ OTP expire हो गया। नया OTP मँगाएं।" }, { status: 400 });
    if (otpResult === "too_many")
      return NextResponse.json({ error: "❌ बहुत बार गलत OTP। नया OTP मँगाएं।" }, { status: 400 });
    if (otpResult === "wrong") {
      const rem = otpRemainingMinutes(ADMIN_OTP_KEY);
      return NextResponse.json({ error: `❌ OTP गलत है। ${rem} मिनट बाकी हैं।` }, { status: 400 });
    }

    const admin = await getSuperAdmin();
    if (!admin) return NextResponse.json({ error: "❌ Super Admin नहीं मिला।" }, { status: 404 });

    await setNewPassword(admin.id, newPassword);
    return NextResponse.json({ ok: true, name: admin.name, email: admin.email });
  }

  // ── Method B: Secret Key से directly reset ───────────────────────────────
  if (body.action === "reset-with-secret") {
    const RESET_SECRET = process.env.RESET_SECRET?.trim();

    if (!RESET_SECRET || RESET_SECRET.length < 6) {
      return NextResponse.json(
        { error: "❌ RESET_SECRET Hostinger में set नहीं है।" },
        { status: 403 }
      );
    }

    const { secretKey, newPassword, confirmPassword } = body;

    if (!secretKey || secretKey !== RESET_SECRET)
      return NextResponse.json(
        { error: "❌ Secret Key गलत है। Hostinger → Environment Variables → RESET_SECRET देखें।" },
        { status: 401 }
      );

    const pwErr = validatePassword(newPassword, confirmPassword);
    if (pwErr) return NextResponse.json({ error: pwErr }, { status: 400 });

    const admin = await getSuperAdmin();
    if (!admin) return NextResponse.json({ error: "❌ Super Admin नहीं मिला।" }, { status: 404 });

    await setNewPassword(admin.id, newPassword);
    return NextResponse.json({ ok: true, name: admin.name, email: admin.email });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
