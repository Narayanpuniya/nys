import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// ── Emergency Super Admin Password Reset ──────────────────────────────────────
// यह endpoint केवल तब काम करता है जब:
// 1. Hostinger में RESET_SECRET env var set हो
// 2. Request में सही secret key हो
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // RESET_SECRET Hostinger env में set नहीं है तो endpoint बंद है
  const RESET_SECRET = process.env.RESET_SECRET;
  if (!RESET_SECRET || RESET_SECRET.trim().length < 8) {
    return NextResponse.json(
      { error: "Emergency reset is disabled. RESET_SECRET not configured." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { secretKey, newPassword, confirmPassword } = body;

  // Secret key check
  if (!secretKey || secretKey !== RESET_SECRET) {
    return NextResponse.json(
      { error: "❌ Secret Key गलत है। Hostinger → Environment Variables में देखें।" },
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

  // SUPER_ADMIN ढूँढो
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

  // नया पासवर्ड hash करके save करो
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: superAdmin.id },
    data: { passwordHash, isActive: true },
  });

  return NextResponse.json({
    ok: true,
    message: `✅ पासवर्ड reset हो गया! Admin: ${superAdmin.name} (${superAdmin.email})`,
    email: superAdmin.email,
  });
}
