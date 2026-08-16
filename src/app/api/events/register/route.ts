import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { eventRegSchema } from "@/lib/validation";
import { generateEventReg } from "@/lib/sequence";

// कार्यक्रम पंजीकरण। स्वचालित registration number बनता है।
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = eventRegSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "अमान्य डेटा", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const d = parsed.data;

  const event = await prisma.event.findUnique({
    where: { id: d.eventId },
    include: { _count: { select: { registrations: true } } },
  });
  if (!event) return NextResponse.json({ error: "कार्यक्रम नहीं मिला" }, { status: 404 });
  if (!event.registrationRequired) {
    return NextResponse.json({ error: "इस कार्यक्रम में पंजीकरण आवश्यक नहीं है" }, { status: 400 });
  }
  if (event.maxParticipants && event._count.registrations >= event.maxParticipants) {
    return NextResponse.json({ error: "पंजीकरण पूर्ण हो चुका है" }, { status: 400 });
  }

  let memberId: string | null = null;
  if (d.memberCode) {
    const m = await prisma.member.findUnique({ where: { memberCode: d.memberCode } });
    memberId = m?.id ?? null;
  }

  const regNumber = await generateEventReg();
  await prisma.eventRegistration.create({
    data: {
      regNumber, eventId: d.eventId, name: d.name, mobile: d.mobile,
      email: d.email || null, memberId, participants: d.participants,
    },
  });

  return NextResponse.json({ ok: true, regNumber });
}
