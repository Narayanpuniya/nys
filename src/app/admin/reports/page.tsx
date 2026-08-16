import Link from "next/link";
import { Download } from "lucide-react";
import { getDashboardStats } from "@/lib/stats";
import { Card } from "@/components/ui/primitives";
import { StatCard } from "@/components/admin/StatCard";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const stats = await getDashboardStats();
  const exports = [
    { type: "members", label: "सदस्य सूची" },
    { type: "donations", label: "दान रिपोर्ट" },
    { type: "income", label: "आय रिपोर्ट" },
    { type: "expenses", label: "व्यय रिपोर्ट" },
    { type: "suggestions", label: "सुझाव रिपोर्ट" },
  ];
  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold text-ink">रिपोर्ट व निर्यात</h1>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="कुल शेष" value={formatINR(stats.balanceAll)} icon="Wallet" tone="purple" />
        <StatCard label="सक्रिय सदस्य" value={stats.activeMembers} icon="Users" tone="green" />
        <StatCard label="प्रकाशित पोस्ट" value={stats.publishedPosts} icon="Newspaper" tone="blue" />
        <StatCard label="अभियान राशि" value={formatINR(stats.campaignsRaised)} icon="Megaphone" tone="saffron" />
      </div>
      <Card className="p-5">
        <h3 className="mb-3 font-bold text-ink">Excel निर्यात</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {exports.map((e) => (
            <a key={e.type} href={`/api/admin/export/${e.type}`} className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 hover:border-saffron-300 hover:bg-saffron-50">
              <Download className="h-4 w-4 text-green-600" /> {e.label}
            </a>
          ))}
        </div>
        <p className="mt-3 text-sm text-stone-400">वित्तीय मासिक रिपोर्ट के लिए <Link href="/admin/finance" className="text-saffron-700">वित्त पृष्ठ</Link> देखें।</p>
      </Card>
    </div>
  );
}
