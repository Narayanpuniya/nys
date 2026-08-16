import { prisma } from "./db";
import { clampPercent } from "./utils";
import type { CampaignCardData } from "@/components/public/CampaignCard";

// Campaign list को progress आँकड़ों के साथ map करता है।
export async function listCampaignsWithProgress(where?: {
  status?: string;
}): Promise<CampaignCardData[]> {
  const campaigns = await prisma.campaign.findMany({
    where: where?.status ? { status: where.status } : { status: { in: ["ACTIVE", "COMPLETED"] } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const grouped = await prisma.donation.groupBy({
    by: ["campaignId"],
    where: { status: "SUCCESS", campaignId: { not: null } },
    _sum: { amount: true },
    _count: true,
  });
  const map = new Map(grouped.map((g) => [g.campaignId, { sum: g._sum.amount ?? 0, count: g._count }]));

  return campaigns.map((c) => {
    const agg = map.get(c.id) ?? { sum: 0, count: 0 };
    return {
      slug: c.slug,
      title: c.title,
      coverImage: c.coverImage,
      goal: c.goalAmount,
      collected: agg.sum,
      remaining: Math.max(0, c.goalAmount - agg.sum),
      percent: clampPercent(agg.sum, c.goalAmount),
      donors: agg.count,
      status: c.status,
    };
  });
}
