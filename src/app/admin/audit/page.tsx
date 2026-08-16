import { prisma } from "@/lib/db";
import { Card, Badge } from "@/components/ui/primitives";
import { formatDateHi } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold text-ink">ऑडिट लॉग</h1>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs text-stone-500">
            <tr><th className="px-4 py-3">कार्य</th><th className="px-4 py-3">विवरण</th><th className="px-4 py-3">उपयोगकर्ता</th><th className="px-4 py-3">दिनांक</th></tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {logs.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-3"><Badge tone="neutral">{l.action}</Badge> <span className="text-xs text-stone-400">{l.entity}</span></td>
                <td className="px-4 py-3 text-stone-700">{l.summary}</td>
                <td className="px-4 py-3 text-stone-500">{l.userName}</td>
                <td className="px-4 py-3 text-stone-400">{formatDateHi(l.createdAt)}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-stone-400">कोई लॉग नहीं।</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
