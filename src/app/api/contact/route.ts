import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { contactSchema } from "@/lib/validation";

// संपर्क फॉर्म — honeypot spam protection के साथ।
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "कृपया सही जानकारी भरें।" }, { status: 400 });
  }
  // honeypot भरा है → bot, चुपचाप success दिखाएँ
  if (parsed.data.website) return NextResponse.json({ ok: true });

  await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      mobile: parsed.data.mobile || null,
      email: parsed.data.email || null,
      message: parsed.data.message,
    },
  });
  return NextResponse.json({ ok: true });
}
