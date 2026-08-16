import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { suggestionSchema } from "@/lib/validation";

// सदस्य सुझाव / समस्या / कार्यक्रम सुझाव।
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = suggestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "कृपया सही जानकारी भरें।" }, { status: 400 });
  }
  const d = parsed.data;

  let memberId: string | null = null;
  if (d.memberCode) {
    const m = await prisma.member.findUnique({ where: { memberCode: d.memberCode } });
    memberId = m?.id ?? null;
  }

  await prisma.suggestion.create({
    data: { name: d.name, subject: d.subject, category: d.category, body: d.body, memberId, status: "NEW" },
  });
  return NextResponse.json({ ok: true });
}
