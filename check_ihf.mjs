import { PrismaClient } from '@prisma/client';
const neon = new PrismaClient({
  datasources: { db: { url: 'postgresql://neondb_owner:npg_1bsXTYeRan0O@ep-billowing-mode-ayvdju06-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' } }
});

const incomes = await neon.income.findMany({ orderBy: { createdAt: 'desc' } });
console.log(`\n=== Income (${incomes.length}) ===`);
incomes.forEach(i => console.log(`  [${i.date.toISOString().slice(0,10)}] ₹${i.amount} | ${i.category} | ${i.source} | ${i.txnCode}`));

const expenses = await neon.expense.findMany({ orderBy: { createdAt: 'desc' } });
console.log(`\n=== Expense (${expenses.length}) ===`);
expenses.forEach(e => console.log(`  [${e.date.toISOString().slice(0,10)}] ₹${e.amount} | ${e.category} | ${e.txnCode}`));

await neon.$disconnect();
