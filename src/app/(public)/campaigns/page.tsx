import type { Metadata } from "next";
import { listCampaignsWithProgress } from "@/lib/campaigns";
import { getI18n } from "@/lib/i18n";
import { CampaignCard } from "@/components/public/CampaignCard";
import { SectionHeading, EmptyState } from "@/components/ui/primitives";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.campaigns_title };
}
export const revalidate = 60;

export default async function CampaignsPage() {
  const [campaigns, { dict }] = await Promise.all([listCampaignsWithProgress(), getI18n()]);
  const active = campaigns.filter((c) => c.status === "ACTIVE");
  const completed = campaigns.filter((c) => c.status === "COMPLETED");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeading title={dict.campaigns_title} subtitle={dict.campaigns_sub} />
      {active.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((c) => <CampaignCard key={c.slug} c={c} dict={dict} />)}
        </div>
      ) : (
        <EmptyState message={dict.campaigns_none} />
      )}

      {completed.length > 0 && (
        <div className="mt-12">
          <SectionHeading title={dict.campaigns_completed} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((c) => <CampaignCard key={c.slug} c={c} dict={dict} />)}
          </div>
        </div>
      )}
    </div>
  );
}
