import { prisma } from "@/lib/db";
import { Card, SectionHeading, Badge, inputClass } from "@/components/ui/primitives";
import { StatCard } from "@/components/admin/StatCard";
import { formatINR, formatDateHi } from "@/lib/utils";
import { addExpense } from "./actions";

export const dynamic = "force-dynamic";

const EXPENSE_CATS = ["Education", "Sports", "Environment", "Craft & Heritage", "Social Service", "Events", "Office", "Travel", "Equipment", "Other"];

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const now = new Date();
  const [y, m] = month ? month.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);

  const [incomeAll, expenseAll, incomeMonth, expenseMonth, incomes, expenses, prevIncome, prevExpense] = await Promise.all([
    prisma.income.aggregate({ where: { status: "ACTIVE" }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { status: "ACTIVE" }, _sum: { amount: true } }),
    prisma.income.aggregate({ where: { status: "ACTIVE", date: { gte: start, lt: end } }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { status: "ACTIVE", date: { gte: start, lt: end } }, _sum: { amount: true } }),
    prisma.income.findMany({ where: { date: { gte: start, lt: end } }, orderBy: { date: "desc" }, take: 50 }),
    prisma.expense.findMany({ where: { date: { gte: start, lt: end } }, orderBy: { date: "desc" }, take: 50 }),
    prisma.income.aggregate({ where: { status: "ACTIVE", date: { lt: start } }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { status: "ACTIVE", date: { lt: start } }, _sum: { amount: true } }),
  ]);

  const opening = (prevIncome._sum.amount ?? 0) - (prevExpense._sum.amount ?? 0);
  const incM = incomeMonth._sum.amount ?? 0;
  const expM = expenseMonth._sum.amount ?? 0;
  const closing = opening + incM - expM;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold text-ink">वित्त प्रबंधन</h1>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="कुल आय" value={formatINR(incomeAll._sum.amount ?? 0)} icon="TrendingUp" tone="green" />
        <StatCard label="कुल व्यय" value={formatINR(expenseAll._sum.amount ?? 0)} icon="TrendingDown" tone="red" />
        <StatCard label="कुल शेष" value={formatINR((incomeAll._sum.amount ?? 0) - (expenseAll._sum.amount ?? 0))} icon="Wallet" tone="purple" />
        <StatCard label="इस माह शेष" value={formatINR(incM - expM)} icon="Calendar" tone="saffron" />
      </div>

      {/* Monthly report */}
      <Card className="mb-6 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-ink">मासिक रिपोर्ट</h3>
          <form className="flex items-center gap-2">
            <input type="month" name="month" defaultValue={`${y}-${String(m).padStart(2, "0")}`} className={inputClass} />
            <button className="rounded-xl bg-saffron-600 px-4 py-2 text-sm font-medium text-white">दिखाएँ</button>
          </form>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          <div className="rounded-xl bg-stone-50 p-3"><div className="text-xs text-stone-500">प्रारंभिक शेष</div><div className="font-bold text-ink">{formatINR(opening)}</div></div>
          <div className="rounded-xl bg-green-50 p-3"><div className="text-xs text-stone-500">+ आय</div><div className="font-bold text-green-700">{formatINR(incM)}</div></div>
          <div className="rounded-xl bg-red-50 p-3"><div className="text-xs text-stone-500">− व्यय</div><div className="font-bold text-red-700">{formatINR(expM)}</div></div>
          <div className="rounded-xl bg-saffron-50 p-3"><div className="text-xs text-stone-500">= अंतिम शेष</div><div className="font-bold text-saffron-800">{formatINR(closing)}</div></div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Income list */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-ink">आय (इस माह)</h3>
            <a href="/api/admin/export/income" className="text-xs text-green-700">Excel ↓</a>
          </div>
          <div className="max-h-80 overflow-y-auto nys-scroll">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-stone-100">
                {incomes.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2"><div className="font-medium text-ink">{i.category}</div><div className="text-xs text-stone-400">{i.source} · {formatDateHi(i.date)}</div></td>
                    <td className="py-2 text-right font-semibold text-green-700">{formatINR(i.amount)}</td>
                  </tr>
                ))}
                {incomes.length === 0 && <tr><td className="py-4 text-center text-stone-400">कोई आय नहीं</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Expense list + add */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-ink">व्यय (इस माह)</h3>
            <a href="/api/admin/export/expenses" className="text-xs text-red-700">Excel ↓</a>
          </div>
          <form action={addExpense} className="mb-3 grid grid-cols-2 gap-2">
            <input name="amount" type="number" placeholder="राशि ₹" required className={inputClass} />
            <select name="category" className={inputClass}>{EXPENSE_CATS.map((c) => <option key={c}>{c}</option>)}</select>
            <input name="description" placeholder="विवरण" className={`${inputClass} col-span-2`} />
            <select name="mode" className={inputClass}><option>CASH</option><option>UPI</option><option>BANK</option><option>CHEQUE</option></select>
            <input name="date" type="date" className={inputClass} />
            <button className="col-span-2 rounded-xl bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700">व्यय जोड़ें</button>
          </form>
          <div className="max-h-64 overflow-y-auto nys-scroll">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-stone-100">
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2"><div className="font-medium text-ink">{e.category}</div><div className="text-xs text-stone-400">{e.description} · {formatDateHi(e.date)}</div></td>
                    <td className="py-2 text-right"><span className="font-semibold text-red-700">{formatINR(e.amount)}</span>{e.status !== "ACTIVE" && <Badge tone="neutral" className="ml-1">{e.status}</Badge>}</td>
                  </tr>
                ))}
                {expenses.length === 0 && <tr><td className="py-4 text-center text-stone-400">कोई व्यय नहीं</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
