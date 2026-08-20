"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { logAudit } from "@/lib/audit";

export async function savePost(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.POSTS_MANAGE);
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const data = {
    title,
    headline: String(formData.get("headline") ?? "").trim() || null,
    reporter: String(formData.get("reporter") ?? "").trim() || null,
    priority: String(formData.get("priority") ?? "NORMAL"),
    categoryId: String(formData.get("categoryId") ?? "") || null,
    location: String(formData.get("location") ?? "") || null,
    excerpt: String(formData.get("excerpt") ?? "") || null,
    content: String(formData.get("content") ?? ""),
    mainImage: String(formData.get("mainImage") ?? "") || null,
    images: String(formData.get("images") ?? "") || null,   // JSON array of gallery URLs
    youtubeUrl: String(formData.get("youtubeUrl") ?? "") || null,
    facebookUrl: String(formData.get("facebookUrl") ?? "") || null,
    impactNumber: formData.get("impactNumber") ? parseInt(String(formData.get("impactNumber")), 10) : null,
    impactLabel: String(formData.get("impactLabel") ?? "") || null,
    status: String(formData.get("status") ?? "DRAFT"),
    featured: formData.get("featured") === "on",
    date: formData.get("date") ? new Date(String(formData.get("date"))) : new Date(),
  };

  if (id) {
    await prisma.post.update({ where: { id }, data });
    await logAudit({ user, action: "UPDATE", entity: "Post", entityId: id, summary: `पोस्ट अपडेट: ${title}` });
  } else {
    const base = slugify(title) || "post";
    const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const created = await prisma.post.create({ data: { ...data, slug, authorId: user.id } });
    await logAudit({ user, action: "CREATE", entity: "Post", entityId: created.id, summary: `नई पोस्ट: ${title}` });
  }
  revalidatePath("/admin/posts");
  revalidatePath("/activities");
  redirect("/admin/posts");
}

export async function deletePost(id: string) {
  const user = await requirePermission(PERMISSIONS.POSTS_MANAGE);
  await prisma.post.update({ where: { id }, data: { status: "ARCHIVED" } });
  await logAudit({ user, action: "UPDATE", entity: "Post", entityId: id, summary: "पोस्ट संग्रहित (archived)" });
  revalidatePath("/admin/posts");
}
