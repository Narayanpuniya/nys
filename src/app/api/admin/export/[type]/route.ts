import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { can, PERMISSIONS } from "@/lib/constants";
import { toXlsx, xlsxResponseHeaders } from "@/lib/excel";
import { formatDateHi } from "@/lib/utils";

// Excel export — filters query params से पास होते हैं।
// /api/admin/export/members | donations | expenses | income | events | participants | campaigns | suggestions | volunteers
export async function GET(req: NextRequest, ctx: { params: Promise<{ type: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { type } = await ctx.params;

  let filename = `${type}.xlsx`;
  let buffer: Buffer;

  switch (type) {
    case "members": {
      if (!can(user.role, PERMISSIONS.MEMBERS_MANAGE)) return forbidden();
      const rows = await prisma.member.findMany({ where: { deletedAt: null }, include: { plan: true }, orderBy: { createdAt: "desc" } });
      buffer = await toXlsx("Members",
        [
          { header: "सदस्य ID", key: "code", width: 20 },
          { header: "नाम", key: "name", width: 24 },
          { header: "मोबाइल", key: "mobile", width: 16 },
          { header: "गाँव", key: "village", width: 16 },
          { header: "योजना", key: "plan", width: 16 },
          { header: "स्थिति", key: "status", width: 12 },
          { header: "सदस्यता तिथि", key: "joined", width: 18 },
          { header: "मान्य तक", key: "valid", width: 18 },
        ],
        rows.map((m) => ({ code: m.memberCode, name: m.fullName, mobile: m.mobile, village: m.village ?? "", plan: m.plan?.name ?? "", status: m.status, joined: formatDateHi(m.joiningDate), valid: m.validUntil ? formatDateHi(m.validUntil) : "" })),
      );
      break;
    }
    case "donations": {
      if (!can(user.role, PERMISSIONS.DONATIONS_MANAGE)) return forbidden();
      const rows = await prisma.donation.findMany({ include: { campaign: true }, orderBy: { createdAt: "desc" } });
      buffer = await toXlsx("Donations",
        [
          { header: "रसीद", key: "r", width: 20 },
          { header: "दानदाता", key: "n", width: 24 },
          { header: "राशि", key: "a", width: 12 },
          { header: "उद्देश्य", key: "p", width: 16 },
          { header: "अभियान", key: "c", width: 24 },
          { header: "स्थिति", key: "s", width: 12 },
          { header: "दिनांक", key: "d", width: 18 },
        ],
        rows.map((d) => ({ r: d.receiptNumber, n: d.donorName, a: d.amount, p: d.purpose, c: d.campaign?.title ?? "", s: d.status, d: formatDateHi(d.paidAt ?? d.createdAt) })),
      );
      break;
    }
    case "expenses": {
      if (!can(user.role, PERMISSIONS.FINANCE_MANAGE)) return forbidden();
      const rows = await prisma.expense.findMany({ orderBy: { date: "desc" } });
      buffer = await toXlsx("Expenses",
        [
          { header: "कोड", key: "c", width: 18 },
          { header: "श्रेणी", key: "cat", width: 18 },
          { header: "राशि", key: "a", width: 12 },
          { header: "विवरण", key: "d", width: 30 },
          { header: "मोड", key: "m", width: 12 },
          { header: "स्थिति", key: "s", width: 12 },
          { header: "दिनांक", key: "dt", width: 18 },
        ],
        rows.map((e) => ({ c: e.txnCode, cat: e.category, a: e.amount, d: e.description ?? "", m: e.mode, s: e.status, dt: formatDateHi(e.date) })),
      );
      break;
    }
    case "income": {
      if (!can(user.role, PERMISSIONS.FINANCE_MANAGE)) return forbidden();
      const rows = await prisma.income.findMany({ orderBy: { date: "desc" } });
      buffer = await toXlsx("Income",
        [
          { header: "कोड", key: "c", width: 18 },
          { header: "स्रोत", key: "src", width: 16 },
          { header: "श्रेणी", key: "cat", width: 18 },
          { header: "राशि", key: "a", width: 12 },
          { header: "विवरण", key: "d", width: 30 },
          { header: "दिनांक", key: "dt", width: 18 },
        ],
        rows.map((i) => ({ c: i.txnCode, src: i.source, cat: i.category, a: i.amount, d: i.description ?? "", dt: formatDateHi(i.date) })),
      );
      break;
    }
    case "participants": {
      if (!can(user.role, PERMISSIONS.EVENTS_MANAGE)) return forbidden();
      const eventId = req.nextUrl.searchParams.get("eventId") ?? undefined;
      const rows = await prisma.eventRegistration.findMany({ where: eventId ? { eventId } : {}, include: { event: true }, orderBy: { createdAt: "desc" } });
      buffer = await toXlsx("Participants",
        [
          { header: "पंजीकरण सं.", key: "r", width: 20 },
          { header: "कार्यक्रम", key: "e", width: 28 },
          { header: "नाम", key: "n", width: 24 },
          { header: "मोबाइल", key: "m", width: 16 },
          { header: "प्रतिभागी", key: "p", width: 10 },
        ],
        rows.map((r) => ({ r: r.regNumber, e: r.event.title, n: r.name, m: r.mobile, p: r.participants })),
      );
      filename = "event-participants.xlsx";
      break;
    }
    case "suggestions": {
      if (!can(user.role, PERMISSIONS.MEMBERS_MANAGE)) return forbidden();
      const rows = await prisma.suggestion.findMany({ orderBy: { createdAt: "desc" } });
      buffer = await toXlsx("Suggestions",
        [
          { header: "नाम", key: "n", width: 24 },
          { header: "विषय", key: "s", width: 28 },
          { header: "श्रेणी", key: "c", width: 16 },
          { header: "स्थिति", key: "st", width: 14 },
          { header: "दिनांक", key: "d", width: 18 },
        ],
        rows.map((s) => ({ n: s.name, s: s.subject, c: s.category, st: s.status, d: formatDateHi(s.createdAt) })),
      );
      break;
    }
    default:
      return NextResponse.json({ error: "unknown export type" }, { status: 400 });
  }

  return new NextResponse(new Uint8Array(buffer), { headers: xlsxResponseHeaders(filename) });
}

function forbidden() {
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}
