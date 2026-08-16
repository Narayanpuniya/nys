import type { Metadata } from "next";
import { getTransparencyStats } from "@/lib/stats";
import { listCampaignsWithProgress } from "@/lib/campaigns";
import { prisma } from "@/lib/db";
import { Card, SectionHeading } from "@/components/ui/primitives";
import { CampaignCard } from "@/components/public/CampaignCard";
import { formatINR, formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "पारदर्शिता" };
export const revalidate = 60;

export default async function TransparencyPage() {
  const [stats, campaigns, reports] = await Promise.all([
    getTransparencyStats(),
    listCampaignsWithProgress(),
    prisma.annualReport.findMany({ where: { published: true }, orderBy: { year: "desc" } }),
  ]);

  const cards = [
    { label: "कुल सक्रिय सदस्य", value: formatNumber(stats.totalMembers) },
    { label: "कुल कार्यक्रम", value: formatNumber(stats.totalPrograms) },
    { label: "कुल दान", value: formatINR(stats.totalDonations) },
    { label: "कुल व्यय", value: formatINR(stats.totalExpenses) },
    { label: "दानदाता", value: formatNumber(stats.donorCount) },
    { label: "लाभान्वित", value: `${formatNumber(stats.beneficiaries)}+` },
    { label: "सक्रिय अभियान", value: formatNumber(stats.activeCampaigns) },
    { label: "संपन्न अभियान", value: formatNumber(stats.completedCampaigns) },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading title="NYS पारदर्शिता" subtitle="संस्था के कार्यों एवं वित्त का सार्वजनिक विवरण। निजी दानदाता जानकारी सार्वजनिक नहीं की जाती।" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-4 text-center">
            <div className="text-2xl font-extrabold text-saffron-800">{c.value}</div>
            <div className="mt-1 text-xs text-stone-500">{c.label}</div>
          </Card>
        ))}
      </div>

      {campaigns.length > 0 && (
        <div className="mt-10">
          <SectionHeading title="अभियान पारदर्शिता" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => <CampaignCard key={c.slug} c={c} />)}
          </div>
        </div>
      )}

      <div className="mt-10">
        <SectionHeading title="सार्वजनिक रिपोर्ट" />
        {reports.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((r) => (
              <Card key={r.id} className="p-5">
                <div className="text-xs text-saffron-700">{r.type} · {r.year}</div>
                <h3 className="mt-1 font-bold text-ink">{r.title}</h3>
                {r.summary && <p className="mt-1 text-sm text-stone-500">{r.summary}</p>}
                {r.pdfUrl && <a href={r.pdfUrl} target="_blank" className="mt-2 inline-block text-sm font-medium text-saffron-700">PDF देखें →</a>}
              </Card>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-saffron-200 p-6 text-center text-sm text-stone-500">
            रिपोर्ट शीघ्र प्रकाशित की जाएँगी।
          </p>
        )}
      </div>
    </div>
  );
}
