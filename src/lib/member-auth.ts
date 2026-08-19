import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
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

// सदस्य login: mobile + memberCode से authenticate करें
export async function loginMember(
  mobile: string,
  memberCode: string
): Promise<{ session: MemberSession; member: Awaited<ReturnType<typeof prisma.member.findUnique>> } | null> {
  const member = await prisma.member.findFirst({
    where: {
      mobile: mobile.trim(),
      memberCode: memberCode.trim().toUpperCase(),
      deletedAt: null,
    },
  });

  if (!member) return null;

  const session: MemberSession = {
    id: member.id,
    memberCode: member.memberCode,
    fullName: member.fullName,
    mobile: member.mobile,
    status: member.status,
  };
  await createMemberSession(session);
  return { session, member };
}
