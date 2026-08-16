import { getSessionUser } from "@/lib/auth";
import { can, ROLE_LABELS, type Role } from "@/lib/constants";
import { ADMIN_NAV } from "@/config/nav";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getI18n } from "@/lib/i18n";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    return <>{children}</>;
  }

  const { locale, dict } = await getI18n();
  const items = ADMIN_NAV
    .filter((it) => !it.perm || can(user.role, it.perm))
    .map((it) => ({ href: it.href, icon: it.icon, label: dict[it.labelKey] }));

  return (
    <div className="flex min-h-screen bg-stone-50">
      <AdminSidebar
        items={items}
        user={{ name: user.name, role: ROLE_LABELS[user.role as Role] ?? user.role }}
        locale={locale}
        logoutLabel={dict.admin_logout}
      />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
