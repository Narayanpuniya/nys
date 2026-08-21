"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { logAudit } from "@/lib/audit";
import { saveUploadedImage } from "@/lib/upload";

export async function saveEvent(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.EVENTS_MANAGE);
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const dateStr = String(formData.get("date") ?? "");
  if (!title || !dateStr) return;

  // पोस्टर upload — नई file हो तो save करो, वरना पुरानी URL रखो
  let posterImage: string | null = null;
  const posterFile = formData.get("posterFile");
  if (posterFile instanceof File && posterFile.size > 0) {
    try {
      posterImage = await saveUploadedImage(posterFile, "events", { maxBytes: 3 * 1024 * 1024 });
    } catch { /* invalid file — skip */ }
  }

  // Edit mode में अगर नई file नहीं upload हुई तो existing posterImage रखो
  if (id && !posterImage) {
    const existing = await prisma.event.findUnique({ where: { id }, select: { posterImage: true } });
    posterImage = existing?.posterImage ?? null;
  }

  const data = {
    title,
    category: String(formData.get("category") ?? "GENERAL"),
    description: String(formData.get("description") ?? ""),
    date: new Date(dateStr),
    time: String(formData.get("time") ?? "") || null,
    venue: String(formData.get("venue") ?? "") || null,
    mapUrl: String(formData.get("mapUrl") ?? "") || null,
    posterImage,
    registrationRequired: formData.get("registrationRequired") === "on",
    maxParticipants: formData.get("maxParticipants") ? parseInt(String(formData.get("maxParticipants")), 10) : null,
    contactPerson: String(formData.get("contactPerson") ?? "") || null,
    contactNumber: String(formData.get("contactNumber") ?? "") || null,
    status: String(formData.get("status") ?? "UPCOMING"),
    featured: formData.get("featured") === "on",
  };

  if (id) {
    await prisma.event.update({ where: { id }, data });
    await logAudit({ user, action: "UPDATE", entity: "Event", entityId: id, summary: `कार्यक्रम अपडेट: ${title}` });
  } else {
    const slug = slugify(title) + "-" + Math.random().toString(36).slice(2, 5);
    const e = await prisma.event.create({ data: { ...data, slug } });
    await logAudit({ user, action: "CREATE", entity: "Event", entityId: e.id, summary: `नया कार्यक्रम: ${title}` });
  }
  revalidatePath("/admin/events");
  revalidatePath("/events");
  redirect("/admin/events");
}
