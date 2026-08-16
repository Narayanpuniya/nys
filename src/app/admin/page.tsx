import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getDashboardStats } from "@/lib/stats";
import { prisma } from "@/lib/db";
import { StatCard } from "@/components/admin/StatCard";
import { Card, SectionHeading, Badge } from "@/components/ui/primitives";
import { formatINR, formatDateHi } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = await getSessionUser();
  const stats = await getDashboardStats();

  const [recentMembers, recentDonations, recentSuggestions] = await Promise.all([
    prisma.member.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.donation.findMany({ where: { status: "SUCCESS" }, orderBy: { paidAt: "desc" }, take: 5 }),
    prisma.suggestion.findMany({ where: { status: "NEW" }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink">नमस्ते, {user?.name} 🙏</h1>
        <p className="text-sm text-stone-500">आज का सारांश एवं संस्था की स्थिति</p>
      </div>

      {/* Today */}
      <SectionHeading title="आज" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="नए सदस्य" value={stats.newMembersToday} icon="UserPlus" />
        <StatCard label="आज दान" value={formatINR(stats.donationsToday)} icon="HandCoins" tone="green" hint={`${stats.donationsTodayCount} लेन-देन`} />
        <StatCard label="इस माह आय" value={formatINR(stats.incomeMonth)} icon="TrendingUp" tone="blue" />
        <StatCard label="इस माह व्यय" value={formatINR(stats.expenseMonth)} icon="TrendingDown" tone="red" />
        <StatCard label="इस माह शेष" value={formatINR(stats.balanceMonth)} icon="Wallet" tone="purple" />
        <StatCard label="नए सुझाव" value={stats.newSuggestions} icon="MessageSquare" />
      </div>

      {/* Membership + Campaigns */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 font-bold text-ink">सदस्यता</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><div className="text-2xl font-extrabold text-green-600">{stats.activeMembers}</div><div className="text-xs text-stone-500">सक्रिय</div></div>
            <div><div className="text-2xl font-extrabold text-amber-600">{stats.pendingMembers}</div><div className="text-xs text-stone-500">लंबित</div></div>
            <div><div className="text-2xl font-extrabold text-red-600">{stats.expiredMembers}</div><div className="text-xs text-stone-500">समाप्त</div></div>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 font-bold text-ink">अभियान</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><div className="text-2xl font-extrabold text-saffron-700">{stats.activeCampaigns}</div><div className="text-xs text-stone-500">सक्रिय</div></div>
            <div><div className="text-lg font-extrabold text-ink">{formatINR(stats.campaignsRaised)}</div><div className="text-xs text-stone-500">कुल प्राप्त</div></div>
            <div><div className="text-2xl font-extrabold text-blue-600">{stats.publishedPosts}</div><div className="text-xs text-stone-500">प्रकाशित पोस्ट</div></div>
          </div>
        </Card>
      </div>

      {/* Recent lists */}
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-ink">नए सदस्य</h3>
            <Link href="/admin/members" className="text-xs text-saffron-700">सभी →</Link>
          </div>
          <ul className="space-y-2 text-sm">
            {recentMembers.map((m) => (
              <li key={m.id} className="flex items-center justify-between">
                <span className="truncate text-stone-600">{m.fullName}</span>
                <Badge tone={m.status === "ACTIVE" ? "green" : "amber"}>{m.status}</Badge>
              </li>
            ))}
            {recentMembers.length === 0 && <li className="text-stone-400">कोई नहीं</li>}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-ink">हाल के दान</h3>
            <Link href="/admin/donations" className="text-xs text-saffron-700">सभी →</Link>
          </div>
          <ul className="space-y-2 text-sm">
            {recentDonations.map((d) => (
              <li key={d.id} className="flex items-center justify-between">
                <span className="truncate text-stone-600">{d.donorName}</span>
                <span className="font-medium text-saffron-800">{formatINR(d.amount)}</span>
              </li>
            ))}
            {recentDonations.length === 0 && <li className="text-stone-400">कोई नहीं</li>}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-ink">नए सुझाव</h3>
            <Link href="/admin/suggestions" className="text-xs text-saffron-700">सभी →</Link>
          </div>
          <ul className="space-y-2 text-sm">
            {recentSuggestions.map((s) => (
              <li key={s.id}>
                <div className="truncate font-medium text-ink">{s.subject}</div>
                <div className="text-xs text-stone-400">{s.name} · {formatDateHi(s.createdAt)}</div>
              </li>
            ))}
            {recentSuggestions.length === 0 && <li className="text-stone-400">कोई नहीं</li>}
          </ul>
        </Card>
      </div>
    </div>
  );
}
