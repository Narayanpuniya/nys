import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { IdCard, Award, Receipt } from "lucide-react";
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
    prisma.member.findMany({ where, include: { plan: true, payments: { orderBy: { paidAt: "desc" }, take: 1, select: { receiptNumber: true } } }, orderBy: { createdAt: "desc" }, skip: (p - 1) * PAGE, take: PAGE }),
    prisma.member.count({ where }),
  ]);
  const pages = Math.ceil(total / PAGE);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">सदस्य ({total})</h1>
        <Link
          href="/admin/members/deleted"
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
        >
          🗑️ Deleted सदस्य
        </Link>
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
                    <div className="flex flex-wrap items-center gap-1.5">
                      {m.status === "PENDING" && (
                        <Link href={`/admin/members/${m.id}`} className="rounded-lg bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800 hover:bg-amber-200">
                          ✅ स्वीकृत करें
                        </Link>
                      )}
                      {/* ID कार्ड */}
                      {m.status === "ACTIVE" && (
                        <Link href={`/id-card/${m.memberCode}`} target="_blank"
                          title="ID कार्ड प्रिन्ट"
                          className="inline-flex items-center gap-1 rounded-lg border border-saffron-200 bg-saffron-50 px-2 py-1 text-xs font-medium text-saffron-800 hover:bg-saffron-100">
                          <IdCard className="h-3.5 w-3.5" /> ID
                        </Link>
                      )}
                      {/* प्रमाण पत्र */}
                      {m.status === "ACTIVE" && (
                        <Link href={`/certificate/${m.memberCode}`} target="_blank"
                          title="प्रमाण पत्र प्रिन्ट"
                          className="inline-flex items-center gap-1 rounded-lg border border-maroon-200 bg-maroon-50 px-2 py-1 text-xs font-medium text-maroon-800 hover:bg-maroon-100">
                          <Award className="h-3.5 w-3.5" /> प्रमाण
                        </Link>
                      )}
                      {/* सदस्यता रसीद */}
                      {m.payments[0]?.receiptNumber && (
                        <Link href={`/membership-receipt/${m.payments[0].receiptNumber}`} target="_blank"
                          title="सदस्यता रसीद प्रिन्ट"
                          className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100">
                          <Receipt className="h-3.5 w-3.5" /> रसीद
                        </Link>
                      )}
                      <Link href={`/admin/members/${m.id}/edit`} className="text-xs font-medium text-saffron-700 hover:underline">
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
