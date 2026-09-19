// रोकड़ बही की entries DB में डालता है (दोबारा चलाने पर पुरानी हटाकर नई डालता है)
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

const prisma = new PrismaClient();
const rows = JSON.parse(readFileSync(new URL("./cashbook-import.json", import.meta.url), "utf8"));

const existing = await prisma.cashBookEntry.count();
if (existing > 0) {
  const photos = await prisma.cashBookPhoto.count();
  if (photos > 0) {
    console.error(`रुकें: ${existing} entries और ${photos} फोटो पहले से हैं — मिटाने से फोटो चले जाएँगे।`);
    process.exit(1);
  }
  await prisma.cashBookEntry.deleteMany({});
  console.log(`पुरानी ${existing} entries हटाईं (कोई फोटो नहीं थी)`);
}

await prisma.cashBookEntry.createMany({
  data: rows.map((r) => ({
    seq: r.seq,
    date: new Date(r.date + "T00:00:00Z"),
    side: r.side,
    particulars: r.particulars,
    voucher: r.voucher ?? null,
    cash: r.cash,
    bank: r.bank,
    amount: r.amount,
    balance: r.balance,
    bookPage: r.bookPage ?? null,
    sourcePhoto: r.sourcePhoto ?? null,
    category: r.category ?? null,
    confidence: r.confidence ?? "high",
    note: r.dateGuessed ? "दिनांक बही में इस पंक्ति पर नहीं लिखी थी — उसी दिन के ब्लॉक से ली गई है।" : null,
    isPublished: true,
  })),
});

const n = await prisma.cashBookEntry.count();
const agg = await prisma.cashBookEntry.groupBy({ by: ["side"], _sum: { amount: true } });
console.log(`डाली गईं: ${n} entries`);
for (const a of agg) console.log(`  ${a.side}: ₹${a._sum.amount?.toLocaleString("en-IN")}`);
await prisma.$disconnect();
