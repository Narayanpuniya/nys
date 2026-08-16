import { prisma } from "@/lib/db";
import { Card, Badge } from "@/components/ui/primitives";
import { ROLE_LABELS, type Role } from "@/lib/constants";
import { formatDateHi } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div>
      <h1 className="mb-2 text-2xl font-extrabold text-ink">एडमिन उपयोगकर्ता</h1>
      <p className="mb-4 text-sm text-stone-500">भूमिका-आधारित पहुँच नियंत्रण (RBAC)। नए उपयोगकर्ता seed या DB से जोड़े जा सकते हैं।</p>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs text-stone-500">
            <tr><th className="px-4 py-3">नाम</th><th className="px-4 py-3">ईमेल</th><th className="px-4 py-3">भूमिका</th><th className="px-4 py-3">स्थिति</th><th className="px-4 py-3">अंतिम लॉगिन</th></tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                <td className="px-4 py-3 text-stone-600">{u.email}</td>
                <td className="px-4 py-3"><Badge tone="saffron">{ROLE_LABELS[u.role as Role] ?? u.role}</Badge></td>
                <td className="px-4 py-3"><Badge tone={u.isActive ? "green" : "neutral"}>{u.isActive ? "सक्रिय" : "निष्क्रिय"}</Badge></td>
                <td className="px-4 py-3 text-stone-400">{u.lastLoginAt ? formatDateHi(u.lastLoginAt) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
