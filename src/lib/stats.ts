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
      totalIncome: 0, totalExpense: 0,
    };
    try {
      const [totalMembers, totalPrograms, schoolPosts, schoolWorkRows, volunteers, donationAgg, treesPosts, cashBook] =
        await Promise.all([
          prisma.member.count({ where: { status: "ACTIVE", deletedAt: null } }),
          prisma.post.count({ where: { status: "PUBLISHED" } }),
          prisma.post.count({ where: { status: "PUBLISHED", category: { slug: "school-sahyog" } } }),
          // विद्यालय से जुड़े काम — बही में दर्ज खर्च से (गतिविधि-पोस्ट वैकल्पिक हैं)
          prisma.cashBookEntry.findMany({
            where: { side: "PAYMENT" },
            select: { particulars: true },
          }),
          prisma.volunteer.count(),
          prisma.donation.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
          prisma.post.aggregate({ where: { status: "PUBLISHED", category: { slug: "paryavaran" } }, _sum: { impactNumber: true } }),
          // रोकड़ बही — असली आय-व्यय (खुला हिसाब पेज वाला)
          prisma.cashBookEntry.groupBy({ by: ["side"], _sum: { amount: true } }),
        ]);
      // विद्यालय/शिक्षा से जुड़े खर्च की पंक्तियाँ गिनो
      const SCHOOL = /विद्यालय|स्कूल|कक्षा|खिड़क|खिडक|दरवाज|छात्रवृत|छात्र|विद्यार्थ|पुस्तक|कंप्यूटर|प्रोत्साहन/i;
      const schoolsSupported =
        schoolPosts + schoolWorkRows.filter((r) => SCHOOL.test(r.particulars)).length;
      const cashOf = (side: string) =>
        Math.round(cashBook.find((c) => c.side === side)?._sum.amount ?? 0);
      const totalIncome = cashOf("RECEIPT");
      const totalExpense = cashOf("PAYMENT");
      const studentsBenefited = await prisma.post.aggregate({
        where: { status: "PUBLISHED", category: { slug: { in: ["shiksha", "school-sahyog"] } } },
        _sum: { impactNumber: true },
      });
      return {
        totalMembers, totalPrograms, schoolsSupported,
        studentsBenefited: studentsBenefited._sum.impactNumber ?? 0,
        trees: treesPosts._sum.impactNumber ?? 0,
        volunteers,
        // ऑनलाइन दान + बही में दर्ज कुल आय
        totalDonations: (donationAgg._sum.amount ?? 0) + totalIncome,
        totalIncome,
        totalExpense,
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
    cashBook,
    bookDonations,
  ] = await Promise.all([
    prisma.member.count({ where: { status: "ACTIVE", deletedAt: null } }),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.donation.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true }, _count: true }),
    prisma.expense.aggregate({ where: { status: "ACTIVE" }, _sum: { amount: true } }),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
    prisma.campaign.count({ where: { status: "COMPLETED" } }),
    // रोकड़ बही — असली आय-व्यय
    prisma.cashBookEntry.groupBy({ by: ["side"], _sum: { amount: true }, _count: true }),
    // दान/सहयोग वाली प्राप्तियाँ (ब्याज व बैंक-निकासी इसमें नहीं)
    prisma.cashBookEntry.count({ where: { side: "RECEIPT", category: "दान/सहयोग" } }),
  ]);

  const beneficiaries = await prisma.post.aggregate({
    where: { status: "PUBLISHED" },
    _sum: { impactNumber: true },
  });

  const cashOf = (side: string) => {
    const row = cashBook.find((c) => c.side === side);
    return { amount: Math.round(row?._sum.amount ?? 0), count: row?._count ?? 0 };
  };
  const bookIn = cashOf("RECEIPT");
  const bookOut = cashOf("PAYMENT");

  return {
    totalMembers,
    totalPrograms,
    // website से हुए online दान + बही में दर्ज सारी आय
    totalDonations: (donationAgg._sum.amount ?? 0) + bookIn.amount,
    donorCount: donationAgg._count + bookDonations,
    totalExpenses: (expenseAgg._sum.amount ?? 0) + bookOut.amount,
    activeCampaigns,
    completedCampaigns,
    beneficiaries: beneficiaries._sum.impactNumber ?? 0,
  };
}
