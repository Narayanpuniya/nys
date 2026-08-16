import type { Metadata } from "next";
import { listCampaignsWithProgress } from "@/lib/campaigns";
import { CampaignCard } from "@/components/public/CampaignCard";
import { SectionHeading, EmptyState } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "अभियान (Crowdfunding)" };
export const revalidate = 60;

export default async function CampaignsPage() {
  const campaigns = await listCampaignsWithProgress();
  const active = campaigns.filter((c) => c.status === "ACTIVE");
  const completed = campaigns.filter((c) => c.status === "COMPLETED");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeading title="NYS अभियान" subtitle="पारदर्शी crowdfunding — हर रुपये का हिसाब।" />
      {active.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((c) => <CampaignCard key={c.slug} c={c} />)}
        </div>
      ) : (
        <EmptyState message="फिलहाल कोई सक्रिय अभियान नहीं है।" />
      )}

      {completed.length > 0 && (
        <div className="mt-12">
          <SectionHeading title="संपन्न अभियान" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((c) => <CampaignCard key={c.slug} c={c} />)}
          </div>
        </div>
      )}
    </div>
  );
}
