// रोकड़ बही का चलता शेष तारीख़-क्रम में दोबारा जोड़ता है
// (वही क्रम जिसमें सूची दिखती है, ताकि शेष पढ़ने में सही लगे)
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const rows = await p.cashBookEntry.findMany({
  orderBy: [{ date: "asc" }, { seq: "asc" }],
  select: { id: true, side: true, amount: true, balance: true },
});
let bal = 0;
const fixes = [];
for (const r of rows) {
  bal += r.side === "RECEIPT" ? r.amount : -r.amount;
  const rd = Math.round(bal * 100) / 100;
  if (Math.abs((r.balance ?? 0) - rd) > 0.005) fixes.push({ id: r.id, balance: rd });
}
if (fixes.length) {
  await p.$transaction(fixes.map(f => p.cashBookEntry.update({ where: { id: f.id }, data: { balance: f.balance } })));
}
console.log("बदली गईं:", fixes.length, "/", rows.length);
console.log("आख़िरी शेष: ₹" + Math.round(bal * 100) / 100);
await p.$disconnect();
