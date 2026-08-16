"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/constants";

export async function updateSuggestion(id: string, formData: FormData) {
  await requirePermission(PERMISSIONS.MEMBERS_MANAGE);
  const status = String(formData.get("status") ?? "NEW");
  const adminReply = String(formData.get("adminReply") ?? "") || null;
  await prisma.suggestion.update({ where: { id }, data: { status, adminReply } });
  revalidatePath("/admin/suggestions");
}
