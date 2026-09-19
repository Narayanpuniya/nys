import { prisma } from "@/lib/db";
import { CashBookManager, type Entry } from "./CashBookManager";

export const dynamic = "force-dynamic";

export default async function CashBookAdminPage() {
  const rows = await prisma.cashBookEntry.findMany({
    orderBy: [{ date: "asc" }, { seq: "asc" }],
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });

  const initial: Entry[] = rows.map((r) => ({
    id: r.id,
    date: r.date.toISOString().slice(0, 10),
    side: r.side === "RECEIPT" ? "RECEIPT" : "PAYMENT",
    particulars: r.particulars,
    voucher: r.voucher,
    cash: r.cash,
    bank: r.bank,
    amount: r.amount,
    balance: r.balance,
    bookPage: r.bookPage,
    category: r.category,
    note: r.note,
    confidence: r.confidence,
    isPublished: r.isPublished,
    photos: r.photos.map((p) => ({ id: p.id, url: p.url, caption: p.caption })),
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <CashBookManager initial={initial} />
    </div>
  );
}
