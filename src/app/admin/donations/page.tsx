import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { Card, Badge } from "@/components/ui/primitives";
import { StatCard } from "@/components/admin/StatCard";
import { Toolbar } from "@/components/admin/Toolbar";
import { formatINR, formatDateHi } from "@/lib/utils";
import { AddDonationModal } from "./AddDonationModal";
import { DonationVerifyActions } from "./DonationActions";

export const dynamic = "force-dynamic";
const PAGE = 20;

export default async function DonationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q, status, page } = await searchParams;
  const p = Math.max(1, parseInt(page ?? "1", 10));

  const where: Prisma.DonationWhereInput = {
    ...(status ? { status } : {}),
    ...(q ? { OR: [{ donorName: { contains: q } }, { receiptNumber: { contains: q } }] } : {}),
  };

  const [rows, total, success, highest, count] = await Promise.all([
    prisma.donation.findMany({ where, include: { campaign: true }, orderBy: { createdAt: "desc" }, skip: (p - 1) * PAGE, take: PAGE }),
    prisma.donation.count({ where }),
    prisma.donation.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
    prisma.donation.findFirst({ where: { status: "SUCCESS" }, orderBy: { amount: "desc" } }),
    prisma.donation.count({ where: { status: "SUCCESS" } }),
  ]);
  const pages = Math.ceil(total / PAGE);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-ink">दान प्रबंधन</h1>
        <AddDonationModal />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="कुल दान (सफल)" value={formatINR(success._sum.amount ?? 0)} icon="HandCoins" tone="green" />
        <StatCard label="सफल लेन-देन" value={count} icon="CheckCircle2" tone="blue" />
        <StatCard label="उच्चतम दान" value={formatINR(highest?.amount ?? 0)} icon="TrendingUp" tone="saffron" />
        <StatCard label="कुल रिकॉर्ड" value={total} icon="Database" tone="purple" />
      </div>

      <Toolbar
        placeholder="दानदाता या रसीद..."
        exportType="donations"
        statusOptions={[
          { value: "SUCCESS", label: "सफल" },
          { value: "PAID", label: "भुगतान प्राप्त (सत्यापन लंबित)" },
          { value: "PENDING", label: "लंबित" },
          { value: "FAILED", label: "विफल/अस्वीकृत" },
          { value: "VOID", label: "निरस्त" },
        ]}
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-xs text-stone-500">
              <tr>
                <th className="px-4 py-3">रसीद</th><th className="px-4 py-3">दानदाता</th>
                <th className="px-4 py-3">राशि</th><th className="px-4 py-3">उद्देश्य</th>
                <th className="px-4 py-3">स्थिति</th><th className="px-4 py-3">दिनांक</th>
                <th className="px-4 py-3">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map((d) => (
                <tr key={d.id} className="hover:bg-saffron-50/40">
                  <td className="px-4 py-3 font-medium">{d.receiptNumber}</td>
                  <td className="px-4 py-3">{d.donorName}</td>
                  <td className="px-4 py-3 font-semibold text-saffron-800">{formatINR(d.amount)}</td>
                  <td className="px-4 py-3">{d.campaign?.title ?? d.purpose}</td>
                  <td className="px-4 py-3">
                    <Badge tone={
                      d.status === "SUCCESS" ? "green" :
                      d.status === "PAID"    ? "blue"  :
                      d.status === "PENDING" ? "amber" : "red"
                    }>
                      {d.status === "SUCCESS" ? "सफल" :
                       d.status === "PAID"    ? "सत्यापन लंबित" :
                       d.status === "PENDING" ? "प्रतीक्षित" :
                       d.status === "FAILED"  ? "अस्वीकृत" : d.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{formatDateHi(d.paidAt ?? d.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      {d.status === "SUCCESS" && (
                        <Link href={`/receipt/${d.receiptNumber}`} target="_blank" className="text-xs font-medium text-saffron-700 hover:underline">रसीद ↗</Link>
                      )}
                      {/* Approve / Reject for PAID or PENDING */}
                      <DonationVerifyActions donationId={d.id} status={d.status} />
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-stone-400">कोई दान नहीं।</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {pages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: pages }).slice(0, 10).map((_, i) => {
            const n = i + 1;
            const params = new URLSearchParams();
            if (q) params.set("q", q); if (status) params.set("status", status); params.set("page", String(n));
            return <Link key={n} href={`/admin/donations?${params.toString()}`} className={`rounded-lg px-3 py-1.5 text-sm ${n === p ? "bg-saffron-600 text-white" : "border border-stone-200 bg-white text-stone-600"}`}>{n}</Link>;
          })}
        </div>
      )}
    </div>
  );
}
