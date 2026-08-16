import { prisma } from "./db";
import { safeJsonParse } from "./utils";

// संस्था की settings (org name, prefixes, fees, social links, privacy...)
// एक JSON blob key "org" में रखते हैं ताकि Admin आसानी से edit कर सके।

export type OrgSettings = {
  name: string;
  shortName: string;
  tagline: string;
  address: string;
  mobile: string;
  email: string;
  currency: string;
  timezone: string;
  memberIdPrefix: string;
  donationReceiptPrefix: string;
  membershipReceiptPrefix: string;
  certPrefix: string;
  monthlyFee: number;
  annualFee: number;
  /** संस्था लोगो (public URL, e.g. /uploads/logo/...) */
  logoUrl?: string;
  branding: {
    presidentSealUrl?: string;
    presidentSignUrl?: string;
    secretarySealUrl?: string;
    secretarySignUrl?: string;
    treasurerSealUrl?: string;
    treasurerSignUrl?: string;
  };
  bank: {
    accountName?: string;
    bankName?: string;
    accountNumber?: string;
    ifsc?: string;
    branch?: string;
    upiId?: string;
    upiQrUrl?: string;
  };
  social: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
    x?: string;
  };
  legal: {
    registrationNo?: string;
    pan?: string;
    has80G?: boolean;
    has12A?: boolean;
    showLegalOnSite?: boolean;
  };
  privacy: {
    donorInfoPublic: boolean;
    showMemberMobileDefault: boolean;
  };
  membershipAutoApprove: boolean;
  reminderFrequencyDays: number;
};

export const DEFAULT_SETTINGS: OrgSettings = {
  name: "नारायणपुरी यूथ सोसाइटी, गुदियाल नगर",
  shortName: "NYS",
  tagline:
    "शिक्षा, खेल, पर्यावरण और विरासत के माध्यम से समाज एवं युवाओं के विकास की ओर एक कदम।",
  address: "गुदियाल नगर, राजस्थान",
  mobile: "+91-00000-00000",
  email: "contact@nys.org",
  currency: "INR",
  timezone: "Asia/Kolkata",
  memberIdPrefix: "NYS-M",
  donationReceiptPrefix: "DON",
  membershipReceiptPrefix: "MEM",
  certPrefix: "NYS-CERT",
  monthlyFee: 100,
  annualFee: 1200,
  logoUrl: "/nys-logo.png",
  branding: {},
  bank: {},
  social: {},
  legal: {
    registrationNo: "COOP/2023/JODHPUR/203833",
    showLegalOnSite: false,
  },
  privacy: { donorInfoPublic: false, showMemberMobileDefault: false },
  membershipAutoApprove: false,
  reminderFrequencyDays: 30,
};

export async function getSettings(): Promise<OrgSettings> {
  const row = await prisma.setting.findUnique({ where: { key: "org" } });
  if (!row) return DEFAULT_SETTINGS;
  const parsed = safeJsonParse<Partial<OrgSettings>>(row.value, {});
  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
    branding: { ...DEFAULT_SETTINGS.branding, ...(parsed.branding ?? {}) },
    bank: { ...DEFAULT_SETTINGS.bank, ...(parsed.bank ?? {}) },
    social: { ...DEFAULT_SETTINGS.social, ...(parsed.social ?? {}) },
    legal: { ...DEFAULT_SETTINGS.legal, ...(parsed.legal ?? {}) },
    privacy: { ...DEFAULT_SETTINGS.privacy, ...(parsed.privacy ?? {}) },
  };
}

export async function saveSettings(next: OrgSettings): Promise<void> {
  await prisma.setting.upsert({
    where: { key: "org" },
    update: { value: JSON.stringify(next) },
    create: { key: "org", value: JSON.stringify(next) },
  });
}
