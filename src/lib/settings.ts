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
    showLegalOnSite: true,
  },
  privacy: { donorInfoPublic: false, showMemberMobileDefault: false },
  membershipAutoApprove: false,
  reminderFrequencyDays: 30,
};

export async function getSettings(): Promise<OrgSettings> {
  try {
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
  } catch (err) {
    console.error("[getSettings] database unavailable, using defaults:", err);
    return DEFAULT_SETTINGS;
  }
}

// ── Hero Slider Slides ────────────────────────────────────────────────────────
export type HeroSlide = {
  id: string;
  imageUrl: string;
  title?: string;
  sortOrder: number;
};

// Built-in NYS background slides (served from public/slides/ — committed to git)
export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  { id: "default-1", imageUrl: "/slides/nys-slide-1.png", title: "NYS परिचय",    sortOrder: 1 },
  { id: "default-2", imageUrl: "/slides/nys-slide-2.png", title: "शिक्षा",         sortOrder: 2 },
  { id: "default-3", imageUrl: "/slides/nys-slide-3.png", title: "खेल",            sortOrder: 3 },
  { id: "default-4", imageUrl: "/slides/nys-slide-4.png", title: "पर्यावरण",       sortOrder: 4 },
  { id: "default-5", imageUrl: "/slides/nys-slide-5.png", title: "NYS से जुड़ें", sortOrder: 5 },
];

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: "hero_slides" } });
    // पहली बार — कभी configure नहीं हुआ → defaults दिखाएँ
    if (!row) return DEFAULT_HERO_SLIDES;
    // Admin ने explicitly configure किया (भले ही [] हो) → वही return करो
    // Admin ने delete किया → [] → HeroSlider gradient fallback दिखाएगा
    return safeJsonParse<HeroSlide[]>(row.value, []);
  } catch {
    return DEFAULT_HERO_SLIDES;
  }
}

export async function saveHeroSlides(slides: HeroSlide[]): Promise<void> {
  await prisma.setting.upsert({
    where: { key: "hero_slides" },
    update: { value: JSON.stringify(slides) },
    create: { key: "hero_slides", value: JSON.stringify(slides) },
  });
}

export async function saveSettings(next: OrgSettings): Promise<void> {
  await prisma.setting.upsert({
    where: { key: "org" },
    update: { value: JSON.stringify(next) },
    create: { key: "org", value: JSON.stringify(next) },
  });
}
