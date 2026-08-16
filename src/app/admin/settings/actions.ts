"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/constants";
import { getSettings, saveSettings, type OrgSettings } from "@/lib/settings";
import { logAudit } from "@/lib/audit";
import { saveUploadedImage } from "@/lib/upload";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function updateSettings(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.SETTINGS_MANAGE);
  const current = await getSettings();

  let logoUrl = current.logoUrl;
  const logoFile = formData.get("logo") as File | null;
  const uploadedLogo = await saveUploadedImage(logoFile, "logo");
  if (uploadedLogo) logoUrl = uploadedLogo;

  const branding = { ...current.branding };
  const brandUploads: Array<{
    field: string;
    key: keyof OrgSettings["branding"];
    category: "seals" | "signatures";
  }> = [
    { field: "presidentSeal", key: "presidentSealUrl", category: "seals" },
    { field: "presidentSign", key: "presidentSignUrl", category: "signatures" },
    { field: "secretarySeal", key: "secretarySealUrl", category: "seals" },
    { field: "secretarySign", key: "secretarySignUrl", category: "signatures" },
    { field: "treasurerSeal", key: "treasurerSealUrl", category: "seals" },
    { field: "treasurerSign", key: "treasurerSignUrl", category: "signatures" },
  ];
  for (const u of brandUploads) {
    const f = formData.get(u.field) as File | null;
    const url = await saveUploadedImage(f, u.category);
    if (url) branding[u.key] = url;
  }

  let upiQrUrl = current.bank.upiQrUrl;
  const upiQrFile = formData.get("upiQr") as File | null;
  const uploadedQr = await saveUploadedImage(upiQrFile, "docs");
  if (uploadedQr) upiQrUrl = uploadedQr;

  const next: OrgSettings = {
    ...current,
    name: str(formData, "name") || current.name,
    shortName: str(formData, "shortName") || current.shortName,
    tagline: str(formData, "tagline") || current.tagline,
    address: str(formData, "address") || current.address,
    mobile: str(formData, "mobile") || current.mobile,
    email: str(formData, "email") || current.email,
    monthlyFee: parseInt(str(formData, "monthlyFee"), 10) || current.monthlyFee,
    annualFee: parseInt(str(formData, "annualFee"), 10) || current.annualFee,
    membershipAutoApprove: formData.get("membershipAutoApprove") === "on",
    logoUrl,
    branding,
    bank: {
      accountName: str(formData, "accountName") || undefined,
      bankName: str(formData, "bankName") || undefined,
      accountNumber: str(formData, "accountNumber") || undefined,
      ifsc: str(formData, "ifsc") || undefined,
      branch: str(formData, "branch") || undefined,
      upiId: str(formData, "upiId") || undefined,
      upiQrUrl,
    },
    social: {
      facebook: str(formData, "facebook") || undefined,
      instagram: str(formData, "instagram") || undefined,
      youtube: str(formData, "youtube") || undefined,
      whatsapp: str(formData, "whatsapp") || undefined,
    },
    legal: {
      ...current.legal,
      registrationNo: str(formData, "registrationNo") || undefined,
      pan: str(formData, "pan") || undefined,
      showLegalOnSite: formData.get("showLegalOnSite") === "on",
    },
    privacy: {
      donorInfoPublic: formData.get("donorInfoPublic") === "on",
      showMemberMobileDefault: formData.get("showMemberMobileDefault") === "on",
    },
  };

  await saveSettings(next);
  await logAudit({ user, action: "UPDATE", entity: "Setting", summary: "संस्था सेटिंग्स अपडेट की" });
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}
