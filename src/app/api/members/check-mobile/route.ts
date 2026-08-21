import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// मोबाइल नंबर already registered है? (soft-deleted को नहीं गिनें)
export async function GET(req: NextRequest) {
  const mobile = req.nextUrl.searchParams.get("mobile")?.trim();
  if (!mobile) return NextResponse.json({ exists: false });

  const existing = await prisma.member.findFirst({
    where: { mobile, deletedAt: null },
    select: { id: true, status: true },
  });

  return NextResponse.json({ exists: !!existing, status: existing?.status ?? null });
}
