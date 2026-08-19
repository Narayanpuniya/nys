// Public site navigation + admin sidebar config
import { PERMISSIONS, type Permission } from "@/lib/constants";
import type { DictKey } from "@/lib/i18n/dictionaries";

export const PUBLIC_NAV: { href: string; labelKey: DictKey }[] = [
  { href: "/", labelKey: "nav_home" },
  { href: "/about", labelKey: "nav_about" },
  { href: "/team", labelKey: "nav_team" },
  { href: "/mentors", labelKey: "nav_mentors" },
  { href: "/activities", labelKey: "nav_activities" },
  { href: "/events", labelKey: "nav_events" },
  { href: "/campaigns", labelKey: "nav_campaigns" },
  { href: "/partners", labelKey: "nav_partners" },
  { href: "/gallery", labelKey: "nav_gallery" },
  { href: "/transparency", labelKey: "nav_transparency" },
  { href: "/contact", labelKey: "nav_contact" },
];

export const PUBLIC_CTA: { href: string; labelKey: DictKey }[] = [
  { href: "/join", labelKey: "nav_join" },
  { href: "/donate", labelKey: "nav_donate" },
];

export type AdminNavItem = {
  href: string;
  labelKey: DictKey;
  icon: string;
  perm?: Permission;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", labelKey: "admin_dashboard", icon: "LayoutDashboard" },
  { href: "/admin/members", labelKey: "admin_members", icon: "Users", perm: PERMISSIONS.MEMBERS_MANAGE },
  { href: "/admin/donations", labelKey: "admin_donations", icon: "HandCoins", perm: PERMISSIONS.DONATIONS_MANAGE },
  { href: "/admin/campaigns", labelKey: "admin_campaigns", icon: "Megaphone", perm: PERMISSIONS.CAMPAIGNS_MANAGE },
  { href: "/admin/finance", labelKey: "admin_finance", icon: "Wallet", perm: PERMISSIONS.FINANCE_MANAGE },
  { href: "/admin/posts", labelKey: "admin_posts", icon: "Newspaper", perm: PERMISSIONS.POSTS_MANAGE },
  { href: "/admin/events", labelKey: "admin_events", icon: "CalendarDays", perm: PERMISSIONS.EVENTS_MANAGE },
  { href: "/admin/gallery", labelKey: "admin_gallery", icon: "Image", perm: PERMISSIONS.GALLERY_MANAGE },
  { href: "/admin/people", labelKey: "admin_people", icon: "Contact", perm: PERMISSIONS.PEOPLE_MANAGE },
  { href: "/admin/partners", labelKey: "admin_partners", icon: "Building2", perm: PERMISSIONS.PEOPLE_MANAGE },
  { href: "/admin/suggestions", labelKey: "admin_suggestions", icon: "MessageSquare", perm: PERMISSIONS.MEMBERS_MANAGE },
  { href: "/admin/volunteers", labelKey: "admin_volunteers", icon: "HeartHandshake", perm: PERMISSIONS.MEMBERS_MANAGE },
  { href: "/admin/reports", labelKey: "admin_reports", icon: "FileBarChart", perm: PERMISSIONS.REPORTS_VIEW },
  { href: "/admin/audit", labelKey: "admin_audit", icon: "ScrollText", perm: PERMISSIONS.AUDIT_VIEW },
  { href: "/admin/users", labelKey: "admin_users", icon: "ShieldCheck", perm: PERMISSIONS.USERS_MANAGE },
  { href: "/admin/hero-slides", labelKey: "admin_hero_slides", icon: "SlidersHorizontal", perm: PERMISSIONS.SETTINGS_MANAGE },
  { href: "/admin/settings", labelKey: "admin_settings", icon: "Settings", perm: PERMISSIONS.SETTINGS_MANAGE },
];
