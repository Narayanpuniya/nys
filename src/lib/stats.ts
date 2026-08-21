import { unstable_cache } from "next/cache";
import { prisma } from "./db";
import { clampPercent } from "./utils";

// Homepage / transparency / dashboard के लिए aggregate आँकड़े।
// सभी numbers DB से आते हैं — कोई hard-coded value नहीं।

export async function getCampaignProgress(campaignId: string) {
  const agg = await prisma.donation.aggregate({
    where: { campaignId, status: "SUCCESS" },
    _sum: { amount: true },
    _count: true,
  });
  const collected = agg._sum.amount ?? 0;
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  const goal = campaign?.goalAmount ?? 0;
  return {
    collected,
    goal,
    remaining: Math.max(0, goal - collected),
    percent: clampPercent(collected, goal),
    donors: agg._count,
  };
}

// Impact counters 2 मिनट cache — home page पर heavy aggregate queries
export const getImpactCounters = unstable_cache(
  async () => {
    const empty = {
      totalMembers: 0, totalPrograms: 0, schoolsSupported: 0,
      studentsBenefited: 0, trees: 0, volunteers: 0, totalDonations: 0,
    };
    try {
      const [totalMembers, totalPrograms, schoolsSupported, volunteers, donationAgg, treesPosts] =
        await Promise.all([
          prisma.member.count({ where: { status: "ACTIVE", deletedAt: null } }),
          prisma.post.count({ where: { status: "PUBLISHED" } }),
          prisma.post.count({ where: { status: "PUBLISHED", category: { slug: "school-sahyog" } } }),
          prisma.volunteer.count(),
          prisma.donation.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
          prisma.post.aggregate({ where: { status: "PUBLISHED", category: { slug: "paryavaran" } }, _sum: { impactNumber: true } }),
        ]);
      const studentsBenefited = await prisma.post.aggregate({
        where: { status: "PUBLISHED", category: { slug: { in: ["shiksha", "school-sahyog"] } } },
        _sum: { impactNumber: true },
      });
      return {
        totalMembers, totalPrograms, schoolsSupported,
        studentsBenefited: studentsBenefited._sum.impactNumber ?? 0,
        trees: treesPosts._sum.impactNumber ?? 0,
        volunteers,
        totalDonations: donationAgg._sum.amount ?? 0,
      };
    } catch (err) {
      console.error("[getImpactCounters] database unavailable:", err);
      return empty;
    }
  },
  ["impact-counters"],
  { revalidate: 120 }, // 2 min
);

export async function getDashboardStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    newMembersToday,
    donationsToday,
    incomeMonth,
    expenseMonth,
    activeMembers,
    pendingMembers,
    expiredMembers,
    activeCampaigns,
    publishedPosts,
    upcomingEvents,
    newSuggestions,
  ] = await Promise.all([
    prisma.member.count({ where: { createdAt: { gte: dayStart }, deletedAt: null } }),
    prisma.donation.aggregate({
      where: { status: "SUCCESS", paidAt: { gte: dayStart } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.income.aggregate({
      where: { status: "ACTIVE", date: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { status: "ACTIVE", date: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.member.count({ where: { status: "ACTIVE", deletedAt: null } }),
    prisma.member.count({ where: { status: "PENDING", deletedAt: null } }),
    prisma.member.count({ where: { status: "EXPIRED", deletedAt: null } }),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.event.count({ where: { status: "UPCOMING" } }),
    prisma.suggestion.count({ where: { status: "NEW" } }),
  ]);

  // lifetime balance
  const [incomeAll, expenseAll, raisedAll] = await Promise.all([
    prisma.income.aggregate({ where: { status: "ACTIVE" }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { status: "ACTIVE" }, _sum: { amount: true } }),
    prisma.donation.aggregate({ where: { status: "SUCCESS", campaignId: { not: null } }, _sum: { amount: true } }),
  ]);

  const incomeMonthVal = incomeMonth._sum.amount ?? 0;
  const expenseMonthVal = expenseMonth._sum.amount ?? 0;

  return {
    newMembersToday,
    donationsToday: donationsToday._sum.amount ?? 0,
    donationsTodayCount: donationsToday._count,
    incomeMonth: incomeMonthVal,
    expenseMonth: expenseMonthVal,
    balanceMonth: incomeMonthVal - expenseMonthVal,
    balanceAll: (incomeAll._sum.amount ?? 0) - (expenseAll._sum.amount ?? 0),
    activeMembers,
    pendingMembers,
    expiredMembers,
    activeCampaigns,
    campaignsRaised: raisedAll._sum.amount ?? 0,
    publishedPosts,
    upcomingEvents,
    newSuggestions,
  };
}

export async function getTransparencyStats() {
  const [
    totalMembers,
    totalPrograms,
    donationAgg,
    expenseAgg,
    activeCampaigns,
    completedCampaigns,
  ] = await Promise.all([
    prisma.member.count({ where: { status: "ACTIVE", deletedAt: null } }),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.donation.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true }, _count: true }),
    prisma.expense.aggregate({ where: { status: "ACTIVE" }, _sum: { amount: true } }),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
    prisma.campaign.count({ where: { status: "COMPLETED" } }),
  ]);

  const beneficiaries = await prisma.post.aggregate({
    where: { status: "PUBLISHED" },
    _sum: { impactNumber: true },
  });

  return {
    totalMembers,
    totalPrograms,
    totalDonations: donationAgg._sum.amount ?? 0,
    donorCount: donationAgg._count,
    totalExpenses: expenseAgg._sum.amount ?? 0,
    activeCampaigns,
    completedCampaigns,
    beneficiaries: beneficiaries._sum.impactNumber ?? 0,
  };
}
