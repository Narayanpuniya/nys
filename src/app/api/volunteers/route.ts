import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2),
  mobile: z.string().trim().optional().or(z.literal("")),
  areas: z.array(z.string()).min(1, "कम से कम एक क्षेत्र चुनें"),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  memberCode: z.string().trim().optional().or(z.literal("")),
});

// स्वयंसेवक बनने का आवेदन।
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "कृपया सही जानकारी भरें।" }, { status: 400 });
  const d = parsed.data;

  let memberId: string | null = null;
  if (d.memberCode) {
    const m = await prisma.member.findUnique({ where: { memberCode: d.memberCode } });
    memberId = m?.id ?? null;
  }

  await prisma.volunteer.create({
    data: { name: d.name, mobile: d.mobile || null, areas: JSON.stringify(d.areas), note: d.note || null, memberId, status: "NEW" },
  });
  return NextResponse.json({ ok: true });
}
