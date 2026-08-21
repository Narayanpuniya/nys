import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { Card, Badge } from "@/components/ui/primitives";
import { Toolbar } from "@/components/admin/Toolbar";
import { formatDateHi } from "@/lib/utils";
import { DeleteMemberButton } from "./[id]/DeleteMemberButton";

export const dynamic = "force-dynamic";
const PAGE = 20;

const statusTone: Record<string, "green" | "amber" | "red" | "neutral"> = {
  ACTIVE: "green", PENDING: "amber", EXPIRED: "red", REJECTED: "neutral",
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q, status, page } = await searchParams;
  const p = Math.max(1, parseInt(page ?? "1", 10));

  const where: Prisma.MemberWhereInput = {
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(q ? { OR: [
      { fullName: { contains: q } },
      { memberCode: { contains: q } },
      { mobile: { contains: q } },
      { village: { contains: q } },
    ] } : {}),
  };

  const [members, total] = await Promise.all([
    prisma.member.findMany({ where, include: { plan: true }, orderBy: { createdAt: "desc" }, skip: (p - 1) * PAGE, take: PAGE }),
    prisma.member.count({ where }),
  ]);
  const pages = Math.ceil(total / PAGE);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">सदस्य ({total})</h1>
      </div>

      <Toolbar
        placeholder="नाम, ID, मोबाइल, गाँव..."
        exportType="members"
        statusOptions={[
          { value: "ACTIVE", label: "सक्रिय" },
          { value: "PENDING", label: "लंबित" },
          { value: "EXPIRED", label: "समाप्त" },
          { value: "REJECTED", label: "अस्वीकृत" },
        ]}
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-xs text-stone-500">
              <tr>
                <th className="px-4 py-3">सदस्य ID</th>
                <th className="px-4 py-3">नाम</th>
                <th className="px-4 py-3">मोबाइल</th>
                <th className="px-4 py-3">गाँव</th>
                <th className="px-4 py-3">योजना</th>
                <th className="px-4 py-3">स्थिति</th>
                <th className="px-4 py-3">तिथि</th>
                <th className="px-4 py-3">कार्य</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-saffron-50/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/members/${m.id}`} className="font-medium text-saffron-800">{m.memberCode}</Link>
                  </td>
                  <td className="px-4 py-3">{m.fullName}</td>
                  <td className="px-4 py-3">{m.mobile}</td>
                  <td className="px-4 py-3">{m.village ?? "—"}</td>
                  <td className="px-4 py-3">{m.plan?.name ?? "—"}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone[m.status] ?? "neutral"}>{m.status}</Badge></td>
                  <td className="px-4 py-3 text-stone-500">{formatDateHi(m.joiningDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {m.status === "PENDING" && (
                        <Link href={`/admin/members/${m.id}`} className="rounded-lg bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800 hover:bg-amber-200">
                          ✅ स्वीकृत करें
                        </Link>
                      )}
                      <Link href={`/admin/members/${m.id}/edit`} className="text-sm font-medium text-saffron-700 hover:underline">
                        संपादित
                      </Link>
                      <DeleteMemberButton memberId={m.id} memberName={m.fullName} compact />
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-stone-400">कोई सदस्य नहीं मिला।</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {pages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: pages }).slice(0, 10).map((_, i) => {
            const n = i + 1;
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (status) params.set("status", status);
            params.set("page", String(n));
            return (
              <Link key={n} href={`/admin/members?${params.toString()}`}
                className={`rounded-lg px-3 py-1.5 text-sm ${n === p ? "bg-saffron-600 text-white" : "bg-white text-stone-600 border border-stone-200"}`}>
                {n}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
