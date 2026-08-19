import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createOtp, verifyOtp, otpRemainingMinutes } from "@/lib/otp-store";
import { sendMemberOtpEmail } from "@/lib/mailer";

// ── Member Password Reset ─────────────────────────────────────────────────────
// action: "send-otp"   → mobile/email से member ढूँढो → OTP उनकी email पर भेजो
// action: "reset"      → OTP verify → नया password set करो
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.action)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  // ── STEP 1: OTP भेजो ────────────────────────────────────────────────────
  if (body.action === "send-otp") {
    const { identifier } = body; // mobile या email

    if (!identifier?.trim())
      return NextResponse.json({ error: "❌ मोबाइल नंबर या ईमेल डालें।" }, { status: 400 });

    // Member ढूँढो
    const id = identifier.trim();
    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { mobile: id },
          { email: id.toLowerCase() },
        ],
      },
    });

    if (!member)
      return NextResponse.json(
        { error: "❌ यह मोबाइल नंबर या ईमेल NYS में registered नहीं है।" },
        { status: 404 }
      );

    if (!member.email)
      return NextResponse.json(
        { error: "❌ आपके account में email नहीं है। Admin से संपर्क करें — वे पासवर्ड reset कर सकते हैं।" },
        { status: 400 }
      );

    // Email config check
    if (!process.env.GMAIL_APP_PASSWORD || !process.env.GMAIL_USER)
      return NextResponse.json(
        { error: "❌ Email service अभी available नहीं है। Admin से संपर्क करें।" },
        { status: 500 }
      );

    const otp = createOtp(`member_${member.id}`);

    try {
      await sendMemberOtpEmail(member.email, member.fullName, otp);
    } catch (err) {
      console.error("Member OTP email error:", err);
      return NextResponse.json(
        { error: "❌ OTP email नहीं भेजा जा सका। Admin से संपर्क करें।" },
        { status: 500 }
      );
    }

    // Email mask करके दिखाएं
    const masked = member.email.replace(/(.{2}).+(@.+)/, "$1****$2");
    return NextResponse.json({
      ok: true,
      memberId: member.id,
      message: `✅ OTP ${masked} पर भेज दिया। 10 मिनट में enter करें।`,
    });
  }

  // ── STEP 2: OTP verify + Password reset ─────────────────────────────────
  if (body.action === "reset") {
    const { memberId, otp, newPassword, confirmPassword } = body;

    if (!memberId)
      return NextResponse.json({ error: "Session expired। वापस जाएं।" }, { status: 400 });

    if (!newPassword || newPassword.length < 6)
      return NextResponse.json({ error: "❌ पासवर्ड कम से कम 6 अक्षर का होना चाहिए।" }, { status: 400 });

    if (newPassword !== confirmPassword)
      return NextResponse.json({ error: "❌ दोनों पासवर्ड एक जैसे नहीं हैं।" }, { status: 400 });

    const otpKey = `member_${memberId}`;
    const result = verifyOtp(otpKey, otp?.toString().trim() ?? "");

    if (result === "expired")
      return NextResponse.json({ error: "❌ OTP expire हो गया। नया OTP मँगाएं।" }, { status: 400 });
    if (result === "too_many")
      return NextResponse.json({ error: "❌ बहुत बार गलत OTP। नया OTP मँगाएं।" }, { status: 400 });
    if (result === "wrong") {
      const rem = otpRemainingMinutes(otpKey);
      return NextResponse.json({ error: `❌ OTP गलत है। ${rem} मिनट बाकी हैं।` }, { status: 400 });
    }

    // Password update
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updated = await prisma.member.update({
      where: { id: memberId },
      data: { passwordHash },
    });

    return NextResponse.json({ ok: true, name: updated.fullName });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
