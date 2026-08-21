"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/constants";
import { generateTxnCode } from "@/lib/sequence";
import { logAudit } from "@/lib/audit";
import { saveUploadedImage } from "@/lib/upload";

const REVALIDATE = () => revalidatePath("/admin/finance");

// ── व्यय जोड़ें ────────────────────────────────────────────────────────────────
export async function addExpense(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.FINANCE_MANAGE);
  const amount = parseInt(String(formData.get("amount") ?? "0"), 10);
  const category = String(formData.get("category") ?? "Other");
  const description = String(formData.get("description") ?? "");
  const mode = String(formData.get("mode") ?? "CASH");
  const dateStr = String(formData.get("date") ?? "").trim();

  if (!amount || amount <= 0) return;
  if (!dateStr) return; // तारीख अनिवार्य

  // बिल/फोटो upload
  const billFile = formData.get("bill");
  let attachment: string | null = null;
  if (billFile instanceof File && billFile.size > 0) {
    try { attachment = await saveUploadedImage(billFile, "finance"); } catch { /* skip */ }
  }

  const txnCode = await generateTxnCode("EXP");
  await prisma.expense.create({
    data: { txnCode, amount, category, description, mode, date: new Date(dateStr), attachment, createdById: user.id },
  });
  await logAudit({ user, action: "CREATE", entity: "Expense", entityId: txnCode, summary: `व्यय जोड़ा: ${category} — ₹${amount}` });
  REVALIDATE();
}

// ── आय जोड़ें ──────────────────────────────────────────────────────────────────
export async function addIncome(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.FINANCE_MANAGE);
  const amount = parseInt(String(formData.get("amount") ?? "0"), 10);
  const category = String(formData.get("category") ?? "Other");
  const description = String(formData.get("description") ?? "");
  const source = String(formData.get("source") ?? "OTHER");
  const mode = String(formData.get("mode") ?? "CASH");
  const dateStr = String(formData.get("date") ?? "").trim();

  if (!amount || amount <= 0) return;
  if (!dateStr) return; // तारीख अनिवार्य

  // बिल/फोटो upload
  const billFile = formData.get("bill");
  let attachment: string | null = null;
  if (billFile instanceof File && billFile.size > 0) {
    try { attachment = await saveUploadedImage(billFile, "finance"); } catch { /* skip */ }
  }

  const txnCode = await generateTxnCode("INC");
  await prisma.income.create({
    data: { txnCode, amount, category, description, source, mode, date: new Date(dateStr), attachment, createdById: user.id },
  });
  await logAudit({ user, action: "CREATE", entity: "Income", entityId: txnCode, summary: `आय जोड़ी: ${category} — ₹${amount}` });
  REVALIDATE();
}

// ── VOID (छुपाएं) ──────────────────────────────────────────────────────────────
export async function voidExpense(id: string) {
  const user = await requirePermission(PERMISSIONS.FINANCE_MANAGE);
  const rec = await prisma.expense.findUnique({ where: { id } });
  await prisma.expense.update({ where: { id }, data: { status: "VOID" } });
  await logAudit({ user, action: "VOID", entity: "Expense", entityId: id, summary: `व्यय निरस्त: ${rec?.category} ₹${rec?.amount}` });
  REVALIDATE();
}

export async function voidIncome(id: string) {
  const user = await requirePermission(PERMISSIONS.FINANCE_MANAGE);
  const rec = await prisma.income.findUnique({ where: { id } });
  await prisma.income.update({ where: { id }, data: { status: "VOID" } });
  await logAudit({ user, action: "VOID", entity: "Income", entityId: id, summary: `आय निरस्त: ${rec?.category} ₹${rec?.amount}` });
  REVALIDATE();
}

// ── Restore (वापस ACTIVE करें) ────────────────────────────────────────────────
export async function restoreExpense(id: string) {
  const user = await requirePermission(PERMISSIONS.FINANCE_MANAGE);
  const rec = await prisma.expense.findUnique({ where: { id } });
  await prisma.expense.update({ where: { id }, data: { status: "ACTIVE" } });
  await logAudit({ user, action: "UPDATE", entity: "Expense", entityId: id, summary: `व्यय पुनः सक्रिय: ${rec?.category} ₹${rec?.amount}` });
  REVALIDATE();
}

export async function restoreIncome(id: string) {
  const user = await requirePermission(PERMISSIONS.FINANCE_MANAGE);
  const rec = await prisma.income.findUnique({ where: { id } });
  await prisma.income.update({ where: { id }, data: { status: "ACTIVE" } });
  await logAudit({ user, action: "UPDATE", entity: "Income", entityId: id, summary: `आय पुनः सक्रिय: ${rec?.category} ₹${rec?.amount}` });
  REVALIDATE();
}

// ── Permanent Delete (DB से हमेशा के लिए हटाएं) ───────────────────────────────
export async function permanentDeleteExpense(id: string) {
  const user = await requirePermission(PERMISSIONS.FINANCE_MANAGE);
  const rec = await prisma.expense.findUnique({ where: { id } });
  await prisma.expense.delete({ where: { id } });
  await logAudit({ user, action: "DELETE", entity: "Expense", entityId: id, summary: `⚠️ व्यय स्थायी हटाया: ${rec?.category} ₹${rec?.amount}` });
  REVALIDATE();
}

export async function permanentDeleteIncome(id: string) {
  const user = await requirePermission(PERMISSIONS.FINANCE_MANAGE);
  const rec = await prisma.income.findUnique({ where: { id } });
  await prisma.income.delete({ where: { id } });
  await logAudit({ user, action: "DELETE", entity: "Income", entityId: id, summary: `⚠️ आय स्थायी हटाई: ${rec?.category} ₹${rec?.amount}` });
  REVALIDATE();
}
