import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const COOKIE = "nys_member_session";
const secret = () =>
  new TextEncoder().encode(process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me");

export type MemberSession = {
  id: string;
  memberCode: string;
  fullName: string;
  mobile: string;
  status: string;
};

export async function createMemberSession(m: MemberSession): Promise<void> {
  const token = await new SignJWT({ ...m })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroyMemberSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getMemberSession(): Promise<MemberSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: payload.id as string,
      memberCode: payload.memberCode as string,
      fullName: payload.fullName as string,
      mobile: payload.mobile as string,
      status: payload.status as string,
    };
  } catch {
    return null;
  }
}

// ── Password hashing helpers (APIs में use करें) ──────────────────────────────
export async function hashMemberPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// ── Login result types ────────────────────────────────────────────────────────
export type LoginOk = { ok: true; session: MemberSession };
export type LoginFail = {
  ok: false;
  reason: "not_found" | "no_password" | "wrong_password";
};
export type LoginResult = LoginOk | LoginFail;

/**
 * सदस्य लॉगिन: मोबाइल नंबर OR ईमेल + पासवर्ड।
 * - identifier: 10 अंक mobile या email address
 * - password: plain-text (bcrypt compare करेगा)
 */
export async function loginMember(
  identifier: string,
  password: string
): Promise<LoginResult> {
  const clean = identifier.trim();
  // मोबाइल नंबर: 10 अंक, 6-9 से शुरू (optionally +91 prefix)
  const isMobile = /^(\+91[- ]?)?[6-9]\d{9}$/.test(clean);

  const member = await prisma.member.findFirst({
    where: {
      deletedAt: null,
      ...(isMobile
        ? { mobile: clean.replace(/^\+91[- ]?/, "") }
        : { email: clean.toLowerCase() }),
    },
  });

  if (!member) return { ok: false, reason: "not_found" };
  if (!member.passwordHash) return { ok: false, reason: "no_password" };

  const match = await bcrypt.compare(password, member.passwordHash);
  if (!match) return { ok: false, reason: "wrong_password" };

  const session: MemberSession = {
    id: member.id,
    memberCode: member.memberCode,
    fullName: member.fullName,
    mobile: member.mobile,
    status: member.status,
  };
  await createMemberSession(session);
  return { ok: true, session };
}
