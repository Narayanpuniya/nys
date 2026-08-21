import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, Badge } from "@/components/ui/primitives";
import { formatDateHi } from "@/lib/utils";
import { RestoreDeleteButtons } from "./RestoreDeleteButtons";

export const dynamic = "force-dynamic";

export default async function DeletedMembersPage() {
  const members = await prisma.member.findMany({
    where: { deletedAt: { not: null } },
    include: { plan: true },
    orderBy: { deletedAt: "desc" },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Link href="/admin/members" className="text-sm text-saffron-700">← सभी सदस्य</Link>
          <h1 className="mt-1 text-2xl font-extrabold text-ink">
            🗑️ Deleted सदस्य ({members.length})
          </h1>
          <p className="text-sm text-stone-500">
            इन सदस्यों को soft-delete किया गया है — restore करें या स्थायी रूप से हटाएं।
          </p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-xs text-stone-500">
              <tr>
                <th className="px-4 py-3">सदस्य ID</th>
                <th className="px-4 py-3">नाम</th>
                <th className="px-4 py-3">मोबाइल</th>
                <th className="px-4 py-3">योजना</th>
                <th className="px-4 py-3">Delete तिथि</th>
                <th className="px-4 py-3">कार्य</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {members.map((m) => (
                <tr key={m.id} className="bg-red-50/30 hover:bg-red-50/60">
                  <td className="px-4 py-3 font-mono text-xs text-stone-500">{m.memberCode}</td>
                  <td className="px-4 py-3 font-medium text-stone-700">{m.fullName}</td>
                  <td className="px-4 py-3 text-stone-600">{m.mobile}</td>
                  <td className="px-4 py-3">
                    <Badge tone="neutral">{m.plan?.name ?? "—"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    {m.deletedAt ? formatDateHi(m.deletedAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <RestoreDeleteButtons memberId={m.id} memberName={m.fullName} />
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-stone-400">
                    ✅ कोई deleted सदस्य नहीं है।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
