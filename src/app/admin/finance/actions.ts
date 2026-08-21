"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/constants";
import { generateTxnCode } from "@/lib/sequence";
import { logAudit } from "@/lib/audit";

export async function addExpense(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.FINANCE_MANAGE);
  const amount = parseInt(String(formData.get("amount") ?? "0"), 10);
  const category = String(formData.get("category") ?? "Other");
  const description = String(formData.get("description") ?? "");
  const mode = String(formData.get("mode") ?? "CASH");
  const dateStr = String(formData.get("date") ?? "");
  if (!amount || amount <= 0) return;

  const txnCode = await generateTxnCode("EXP");
  await prisma.expense.create({
    data: { txnCode, amount, category, description, mode, date: dateStr ? new Date(dateStr) : new Date(), createdById: user.id },
  });
  await logAudit({ user, action: "CREATE", entity: "Expense", entityId: txnCode, summary: `व्यय जोड़ा: ${category} — ₹${amount}` });
  revalidatePath("/admin/finance");
}

export async function addIncome(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.FINANCE_MANAGE);
  const amount = parseInt(String(formData.get("amount") ?? "0"), 10);
  const category = String(formData.get("category") ?? "Other");
  const description = String(formData.get("description") ?? "");
  const source = String(formData.get("source") ?? "OTHER");
  const mode = String(formData.get("mode") ?? "CASH");
  if (!amount || amount <= 0) return;

  const txnCode = await generateTxnCode("INC");
  await prisma.income.create({
    data: { txnCode, amount, category, description, source, mode, createdById: user.id },
  });
  await logAudit({ user, action: "CREATE", entity: "Income", entityId: txnCode, summary: `आय जोड़ी: ${category} — ₹${amount}` });
  revalidatePath("/admin/finance");
}

// Financial records को delete नहीं, VOID करें (audit-safe)।
export async function voidExpense(id: string) {
  const user = await requirePermission(PERMISSIONS.FINANCE_MANAGE);
  const rec = await prisma.expense.findUnique({ where: { id } });
  await prisma.expense.update({ where: { id }, data: { status: "VOID" } });
  await logAudit({ user, action: "VOID", entity: "Expense", entityId: id, summary: `व्यय निरस्त: ${rec?.category} ₹${rec?.amount}` });
  revalidatePath("/admin/finance");
}

export async function voidIncome(id: string) {
  const user = await requirePermission(PERMISSIONS.FINANCE_MANAGE);
  const rec = await prisma.income.findUnique({ where: { id } });
  await prisma.income.update({ where: { id }, data: { status: "VOID" } });
  await logAudit({ user, action: "VOID", entity: "Income", entityId: id, summary: `आय निरस्त: ${rec?.category} ₹${rec?.amount}` });
  revalidatePath("/admin/finance");
}
