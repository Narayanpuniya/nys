import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

/** सदस्य सूची — टीम/मार्गदर्शक पिकर के लिए */
export async function GET(req: NextRequest) {
  if (!await getSessionUser()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  const members = await prisma.member.findMany({
    where: {
      deletedAt: null,
      status: { not: "REJECTED" },
      ...(q ? {
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { mobile: { contains: q } },
          { memberCode: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    },
    select: {
      id: true,
      memberCode: true,
      fullName: true,
      photoUrl: true,
      mobile: true,
      occupation: true,
      village: true,
    },
    orderBy: { fullName: "asc" },
    take: 50,
  });

  return NextResponse.json({ members });
}
