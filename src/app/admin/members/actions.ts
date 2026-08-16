"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/constants";
import { generateCertNumber, generateTxnCode } from "@/lib/sequence";
import { getSettings } from "@/lib/settings";
import { logAudit } from "@/lib/audit";
import { saveUploadedImage } from "@/lib/upload";

export async function approveMember(memberId: string) {
  const user = await requirePermission(PERMISSIONS.MEMBERS_MANAGE);
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { plan: true, certificates: true, payments: { orderBy: { paidAt: "desc" } } },
  });
  if (!member) return;

  const settings = await getSettings();
  const days = member.plan?.periodDays ?? 365;
  const validUntil = new Date(Date.now() + days * 86400000);

  await prisma.member.update({ where: { id: memberId }, data: { status: "ACTIVE", validUntil } });

  // ऑफलाइन रसीद वाले PENDING भुगतान → SUCCESS + Income
  const pendingPays = member.payments.filter((p) => p.status === "PENDING");
  for (const pay of pendingPays) {
    await prisma.membershipPayment.update({
      where: { id: pay.id },
      data: { status: "SUCCESS" },
    });
    const alreadyIncome = await prisma.income.findFirst({
      where: { refType: "MembershipPayment", refId: memberId, amount: pay.amount },
    });
    if (!alreadyIncome) {
      await prisma.income.create({
        data: {
          txnCode: await generateTxnCode("INC"),
          source: "MEMBERSHIP",
          category: member.plan?.name ?? "सदस्यता",
          amount: pay.amount,
          description: `सदस्यता (रसीद स्वीकृत) — ${member.fullName} (${member.memberCode})`,
          mode: pay.mode === "ONLINE" ? "ONLINE" : "UPI",
          refType: "MembershipPayment",
          refId: pay.id,
        },
      });
    }
  }

  if (member.certificates.length === 0) {
    const certNumber = await generateCertNumber(settings.certPrefix);
    await prisma.certificate.create({ data: { certNumber, memberId, type: "MEMBERSHIP" } });
  }
  await logAudit({ user, action: "UPDATE", entity: "Member", entityId: memberId, summary: `${member.fullName} की सदस्यता स्वीकृत` });
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${memberId}`);
}

export async function rejectMember(memberId: string) {
  const user = await requirePermission(PERMISSIONS.MEMBERS_MANAGE);
  const member = await prisma.member.update({ where: { id: memberId }, data: { status: "REJECTED" } });
  await logAudit({ user, action: "UPDATE", entity: "Member", entityId: memberId, summary: `${member.fullName} की सदस्यता अस्वीकृत` });
  revalidatePath("/admin/members");
}

export async function toggleMemberMobile(memberId: string, show: boolean) {
  await requirePermission(PERMISSIONS.MEMBERS_MANAGE);
  await prisma.member.update({ where: { id: memberId }, data: { showMobile: show } });
  revalidatePath(`/admin/members/${memberId}`);
}

export type UpdateMemberState = { error?: string; ok?: boolean };

export async function updateMember(
  memberId: string,
  _prev: UpdateMemberState,
  formData: FormData,
): Promise<UpdateMemberState> {
  const user = await requirePermission(PERMISSIONS.MEMBERS_MANAGE);
  const existing = await prisma.member.findUnique({ where: { id: memberId } });
  if (!existing || existing.deletedAt) return { error: "सदस्य नहीं मिला।" };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const mobile = String(formData.get("mobile") ?? "").trim();
  if (fullName.length < 2) return { error: "नाम आवश्यक है।" };
  if (!/^(\+91[- ]?)?[6-9]\d{9}$/.test(mobile)) return { error: "मान्य मोबाइल नंबर दर्ज करें।" };

  let photoUrl = existing.photoUrl;
  try {
    const uploaded = await saveUploadedImage(formData.get("photo") as File | null, "members");
    if (uploaded) photoUrl = uploaded;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "फोटो अपलोड विफल।" };
  }

  const planId = String(formData.get("planId") ?? "").trim() || null;
  const status = String(formData.get("status") ?? existing.status);
  const dobRaw = String(formData.get("dob") ?? "").trim();

  await prisma.member.update({
    where: { id: memberId },
    data: {
      fullName,
      guardianName: String(formData.get("guardianName") ?? "").trim() || null,
      dob: dobRaw ? new Date(dobRaw) : null,
      gender: String(formData.get("gender") ?? "").trim() || null,
      mobile,
      whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      address: String(formData.get("address") ?? "").trim() || null,
      village: String(formData.get("village") ?? "").trim() || null,
      district: String(formData.get("district") ?? "").trim() || null,
      state: String(formData.get("state") ?? "").trim() || null,
      occupation: String(formData.get("occupation") ?? "").trim() || null,
      bloodGroup: String(formData.get("bloodGroup") ?? "").trim() || null,
      emergencyContact: String(formData.get("emergencyContact") ?? "").trim() || null,
      photoUrl,
      planId,
      status,
      showMobile: formData.get("showMobile") === "on",
    },
  });

  await logAudit({
    user,
    action: "UPDATE",
    entity: "Member",
    entityId: memberId,
    summary: `${fullName} की प्रोफ़ाइल अपडेट की`,
  });

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath(`/admin/members/${memberId}/edit`);
  redirect(`/admin/members/${memberId}`);
}
