"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { logAudit } from "@/lib/audit";

export async function saveCampaign(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.CAMPAIGNS_MANAGE);
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const data = {
    title,
    goalAmount: parseInt(String(formData.get("goalAmount") ?? "0"), 10) || 0,
    category: String(formData.get("category") ?? "GENERAL"),
    beneficiary: String(formData.get("beneficiary") ?? "") || null,
    location: String(formData.get("location") ?? "") || null,
    description: String(formData.get("description") ?? ""),
    coverImage: String(formData.get("coverImage") ?? "") || null,
    status: String(formData.get("status") ?? "ACTIVE"),
    featured: formData.get("featured") === "on",
    endDate: formData.get("endDate") ? new Date(String(formData.get("endDate"))) : null,
  };

  if (id) {
    await prisma.campaign.update({ where: { id }, data });
    await logAudit({ user, action: "UPDATE", entity: "Campaign", entityId: id, summary: `अभियान अपडेट: ${title}` });
  } else {
    const slug = slugify(title) + "-" + Math.random().toString(36).slice(2, 5);
    const c = await prisma.campaign.create({ data: { ...data, slug } });
    await logAudit({ user, action: "CREATE", entity: "Campaign", entityId: c.id, summary: `नया अभियान: ${title}` });
  }
  revalidatePath("/admin/campaigns");
  revalidatePath("/campaigns");
  redirect("/admin/campaigns");
}

export async function addCampaignUpdate(campaignId: string, formData: FormData) {
  await requirePermission(PERMISSIONS.CAMPAIGNS_MANAGE);
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) return;
  await prisma.campaignUpdate.create({ data: { campaignId, title, body } });
  revalidatePath(`/admin/campaigns/${campaignId}`);
  revalidatePath("/campaigns");
}
