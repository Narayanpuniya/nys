import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, hashPassword } from "@/lib/auth";

async function requireSuperAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "केवल सुपर एडमिन यह कर सकते हैं।" }, { status: 403 });
  return user;
}

// ── POST: नया admin user जोड़ें ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const me = await requireSuperAdmin();
  if (me instanceof NextResponse) return me;

  const { name, email, password, role } = await req.json();
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return NextResponse.json({ error: "नाम, ईमेल और पासवर्ड आवश्यक हैं।" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "पासवर्ड कम से कम 6 अक्षर का होना चाहिए।" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existing) return NextResponse.json({ error: "यह ईमेल पहले से पंजीकृत है।" }, { status: 400 });

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: await hashPassword(password),
      role: role || "CONTENT_MANAGER",
      isActive: true,
    },
  });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}

// ── PATCH: संपादित करें / पासवर्ड reset ────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const me = await requireSuperAdmin();
  if (me instanceof NextResponse) return me;

  const { id, name, email, role, isActive, newPassword } = await req.json();
  if (!id) return NextResponse.json({ error: "id आवश्यक है।" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (name)     data.name     = name.trim();
  if (email)    data.email    = email.toLowerCase().trim();
  if (role)     data.role     = role;
  if (isActive !== undefined) data.isActive = isActive;
  if (newPassword) {
    if (newPassword.length < 6) return NextResponse.json({ error: "पासवर्ड कम से कम 6 अक्षर का होना चाहिए।" }, { status: 400 });
    data.passwordHash = await hashPassword(newPassword);
  }

  const updated = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ id: updated.id, name: updated.name });
}

// ── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const me = await requireSuperAdmin();
  if (me instanceof NextResponse) return me;

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id आवश्यक है।" }, { status: 400 });

  // खुद को delete नहीं कर सकते
  if (id === me.id) return NextResponse.json({ error: "आप खुद को delete नहीं कर सकते।" }, { status: 400 });

  // आखिरी SUPER_ADMIN को delete नहीं करें
  const superAdmins = await prisma.user.count({ where: { role: "SUPER_ADMIN", isActive: true } });
  const target = await prisma.user.findUnique({ where: { id } });
  if (target?.role === "SUPER_ADMIN" && superAdmins <= 1) {
    return NextResponse.json({ error: "कम से कम एक सुपर एडमिन होना चाहिए।" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
