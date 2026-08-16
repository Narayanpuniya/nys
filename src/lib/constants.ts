// NYS — केंद्रीय constants (statuses, roles, categories)
// SQLite/Postgres दोनों के लिए हम native enum की जगह string constants रखते हैं।

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  PRESIDENT: "PRESIDENT",
  SECRETARY: "SECRETARY",
  TREASURER: "TREASURER",
  CONTENT_MANAGER: "CONTENT_MANAGER",
  EVENT_MANAGER: "EVENT_MANAGER",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "सुपर एडमिन",
  PRESIDENT: "अध्यक्ष",
  SECRETARY: "सचिव",
  TREASURER: "कोषाध्यक्ष",
  CONTENT_MANAGER: "कंटेंट मैनेजर",
  EVENT_MANAGER: "इवेंट मैनेजर",
};

// Granular permissions
export const PERMISSIONS = {
  MEMBERS_MANAGE: "members.manage",
  FINANCE_MANAGE: "finance.manage",
  DONATIONS_MANAGE: "donations.manage",
  CAMPAIGNS_MANAGE: "campaigns.manage",
  POSTS_MANAGE: "posts.manage",
  EVENTS_MANAGE: "events.manage",
  GALLERY_MANAGE: "gallery.manage",
  PEOPLE_MANAGE: "people.manage",
  SETTINGS_MANAGE: "settings.manage",
  USERS_MANAGE: "users.manage",
  REPORTS_VIEW: "reports.view",
  AUDIT_VIEW: "audit.view",
  APPROVALS: "approvals",
} as const;
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ALL: Permission[] = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: ALL,
  PRESIDENT: [
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.APPROVALS,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.MEMBERS_MANAGE,
    PERMISSIONS.DONATIONS_MANAGE,
    PERMISSIONS.CAMPAIGNS_MANAGE,
  ],
  SECRETARY: [
    PERMISSIONS.MEMBERS_MANAGE,
    PERMISSIONS.EVENTS_MANAGE,
    PERMISSIONS.POSTS_MANAGE,
    PERMISSIONS.PEOPLE_MANAGE,
    PERMISSIONS.GALLERY_MANAGE,
    PERMISSIONS.REPORTS_VIEW,
  ],
  TREASURER: [
    PERMISSIONS.FINANCE_MANAGE,
    PERMISSIONS.DONATIONS_MANAGE,
    PERMISSIONS.CAMPAIGNS_MANAGE,
    PERMISSIONS.REPORTS_VIEW,
  ],
  CONTENT_MANAGER: [
    PERMISSIONS.POSTS_MANAGE,
    PERMISSIONS.GALLERY_MANAGE,
    PERMISSIONS.PEOPLE_MANAGE,
  ],
  EVENT_MANAGER: [PERMISSIONS.EVENTS_MANAGE],
};

export function can(role: string | undefined | null, perm: Permission): boolean {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role as Role];
  return !!perms && perms.includes(perm);
}

// ─── Status sets ───
export const MEMBER_STATUS = ["PENDING", "ACTIVE", "EXPIRED", "REJECTED"] as const;
export const PAYMENT_STATUS = ["PENDING", "SUCCESS", "FAILED", "VOID"] as const;
export const DONATION_STATUS = ["PENDING", "SUCCESS", "FAILED", "VOID"] as const;
export const CAMPAIGN_STATUS = ["DRAFT", "ACTIVE", "COMPLETED", "CLOSED"] as const;
export const EVENT_STATUS = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"] as const;
export const POST_STATUS = ["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"] as const;
export const SUGGESTION_STATUS = ["NEW", "REVIEW", "ACCEPTED", "REJECTED", "IMPLEMENTED"] as const;
export const PAYMENT_MODES = ["ONLINE", "CASH", "UPI", "BANK", "CHEQUE", "OTHER"] as const;

// ─── Activity categories ───
export const ACTIVITY_CATEGORIES = [
  { slug: "shiksha", name: "शिक्षा", icon: "GraduationCap", color: "#2563eb", summary: "स्कूल सहयोग, विद्यार्थियों की सहायता, शैक्षिक कार्यक्रम।" },
  { slug: "khel", name: "खेल", icon: "Trophy", color: "#f59e0b", summary: "खेल प्रतियोगिताएं, sports material, युवा गतिविधियाँ।" },
  { slug: "paryavaran", name: "पर्यावरण", icon: "Leaf", color: "#16a34a", summary: "पेड़ लगाना, सफाई अभियान, जल संरक्षण।" },
  { slug: "craft-heritage", name: "Craft & Heritage", icon: "Palette", color: "#db2777", summary: "स्थानीय कला, संस्कृति और पारंपरिक शिल्प संरक्षण।" },
  { slug: "samajik-seva", name: "सामाजिक सेवा", icon: "HeartHandshake", color: "#dc2626", summary: "जरूरतमंदों की सहायता एवं सामाजिक कल्याण।" },
  { slug: "yuva-vikas", name: "युवा विकास", icon: "Users", color: "#7c3aed", summary: "युवाओं का कौशल एवं नेतृत्व विकास।" },
  { slug: "school-sahyog", name: "स्कूल सहयोग", icon: "School", color: "#0891b2", summary: "विद्यालयों को संसाधन एवं सहयोग।" },
  { slug: "innovation", name: "Innovation / Technology", icon: "Lightbulb", color: "#4f46e5", summary: "तकनीक एवं नवाचार आधारित पहल।" },
] as const;

export const DONATION_PURPOSES = [
  { key: "EDUCATION", label: "शिक्षा" },
  { key: "SPORTS", label: "खेल" },
  { key: "ENVIRONMENT", label: "पर्यावरण" },
  { key: "CRAFT_HERITAGE", label: "Craft & Heritage" },
  { key: "SOCIAL_SERVICE", label: "सामाजिक सेवा" },
  { key: "GENERAL", label: "सामान्य कोष" },
  { key: "CAMPAIGN", label: "विशेष अभियान" },
] as const;

export const VOLUNTEER_AREAS = [
  "शिक्षा", "खेल", "पर्यावरण", "Events", "समाज सेवा",
  "Technology", "Photography", "Design", "Fundraising",
] as const;
