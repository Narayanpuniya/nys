import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

/** रोकड़ बही की entries — admin CRUD. हर खाना बदला जा सकता है (दिनांक सहित)। */

async function guard() {
  return (await getSessionUser()) ? null : NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function num(v: FormDataEntryValue | null): number {
  const n = parseFloat(String(v ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export async function GET(req: NextRequest) {
  const bad = await guard();
  if (bad) return bad;
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const items = await prisma.cashBookEntry.findMany({
    where: q
      ? {
          OR: [
            { particulars: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
            { voucher: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ date: "asc" }, { seq: "asc" }],
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const bad = await guard();
  if (bad) return bad;
  const fd = await req.formData();
  const particulars = String(fd.get("particulars") ?? "").trim();
  const dateStr = String(fd.get("date") ?? "").trim();
  if (!particulars || !dateStr) {
    return NextResponse.json({ error: "दिनांक और विवरण ज़रूरी हैं" }, { status: 400 });
  }
  const cash = num(fd.get("cash"));
  const bank = num(fd.get("bank"));
  const last = await prisma.cashBookEntry.findFirst({ orderBy: { seq: "desc" } });
  const item = await prisma.cashBookEntry.create({
    data: {
      date: new Date(dateStr + "T00:00:00Z"),
      side: String(fd.get("side") ?? "PAYMENT") === "RECEIPT" ? "RECEIPT" : "PAYMENT",
      particulars,
      voucher: String(fd.get("voucher") ?? "").trim() || null,
      cash,
      bank,
      amount: cash + bank,
      balance: 0,
      bookPage: fd.get("bookPage") ? Math.trunc(num(fd.get("bookPage"))) : null,
      category: String(fd.get("category") ?? "").trim() || null,
      note: String(fd.get("note") ?? "").trim() || null,
      sourcePhoto: String(fd.get("sourcePhoto") ?? "").trim() || null,
      isPublished: fd.get("isPublished") !== "false",
      seq: (last?.seq ?? 0) + 1,
    },
  });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest) {
  const bad = await guard();
  if (bad) return bad;
  const fd = await req.formData();
  const id = String(fd.get("id") ?? "").trim();
  if (!id) return NextResponse.json({ error: "id चाहिए" }, { status: 400 });

  const data: Record<string, unknown> = {};
  const has = (k: string) => fd.get(k) !== null;

  if (has("date")) {
    const v = String(fd.get("date")).trim();
    if (!v) return NextResponse.json({ error: "दिनांक खाली नहीं हो सकती" }, { status: 400 });
    data.date = new Date(v + "T00:00:00Z");
  }
  if (has("particulars")) {
    const v = String(fd.get("particulars")).trim();
    if (!v) return NextResponse.json({ error: "विवरण खाली नहीं हो सकता" }, { status: 400 });
    data.particulars = v;
  }
  if (has("side")) data.side = String(fd.get("side")) === "RECEIPT" ? "RECEIPT" : "PAYMENT";
  if (has("voucher")) data.voucher = String(fd.get("voucher")).trim() || null;
  if (has("category")) data.category = String(fd.get("category")).trim() || null;
  if (has("note")) data.note = String(fd.get("note")).trim() || null;
  if (has("bookPage")) {
    const v = String(fd.get("bookPage")).trim();
    data.bookPage = v ? Math.trunc(num(v)) : null;
  }
  if (has("isPublished")) data.isPublished = fd.get("isPublished") !== "false";
  if (has("confidence")) data.confidence = String(fd.get("confidence"));
  if (has("cash") || has("bank")) {
    const cur = await prisma.cashBookEntry.findUnique({ where: { id } });
    if (!cur) return NextResponse.json({ error: "entry नहीं मिली" }, { status: 404 });
    const cash = has("cash") ? num(fd.get("cash")) : cur.cash;
    const bank = has("bank") ? num(fd.get("bank")) : cur.bank;
    data.cash = cash;
    data.bank = bank;
    data.amount = cash + bank;
  }

  const item = await prisma.cashBookEntry.update({ where: { id }, data });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const bad = await guard();
  if (bad) return bad;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id चाहिए" }, { status: 400 });
  await prisma.cashBookEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
