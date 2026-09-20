import Link from "next/link";
import type { Metadata } from "next";
import { getTransparencyStats } from "@/lib/stats";
import { listCampaignsWithProgress } from "@/lib/campaigns";
import { prisma } from "@/lib/db";
import { getI18n } from "@/lib/i18n";
import { Card, SectionHeading } from "@/components/ui/primitives";
import { CampaignCard } from "@/components/public/CampaignCard";
import { formatINR, formatNumber } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.transparency_title };
}
export const revalidate = 60;

export default async function TransparencyPage() {
  const [stats, campaigns, reports, { dict }] = await Promise.all([
    getTransparencyStats(),
    listCampaignsWithProgress(),
    prisma.annualReport.findMany({ where: { published: true }, orderBy: { year: "desc" } }),
    getI18n(),
  ]);

  const cards = [
    { label: dict.tr_total_members,       value: formatNumber(stats.totalMembers) },
    { label: dict.tr_total_programs,      value: formatNumber(stats.totalPrograms) },
    { label: dict.tr_total_donations,     value: formatINR(stats.totalDonations) },
    { label: dict.tr_total_expenses,      value: formatINR(stats.totalExpenses) },
    { label: dict.tr_donors,              value: formatNumber(stats.donorCount) },
    { label: dict.tr_beneficiaries,       value: `${formatNumber(stats.beneficiaries)}+` },
    { label: dict.tr_active_campaigns,    value: formatNumber(stats.activeCampaigns) },
    { label: dict.tr_completed_campaigns, value: formatNumber(stats.completedCampaigns) },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading title={`NYS ${dict.transparency_title}`} subtitle={`${dict.transparency_sub} ${dict.tr_private_note}`} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-4 text-center">
            <div className="text-2xl font-extrabold text-saffron-800">{c.value}</div>
            <div className="mt-1 text-xs text-stone-500">{c.label}</div>
          </Card>
        ))}
      </div>

      {/* पूरा ब्यौरा — खुला हिसाब */}
      <Link
        href="/hisab"
        className="mt-6 flex items-center justify-between gap-4 rounded-2xl border-2 border-maroon-200 bg-white p-5 transition hover:border-saffron-400 hover:shadow-md"
      >
        <span>
          <span className="block text-lg font-bold text-maroon-900">खुला हिसाब — एक-एक रुपये का ब्यौरा</span>
          <span className="mt-1 block text-sm text-stone-600">
            कब, किससे कितना दान मिला और कहाँ, किस काम पर कितना खर्च हुआ — पूरी सूची, काम की तस्वीरों सहित।
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-maroon-800 px-4 py-2 text-sm font-bold text-white">देखें →</span>
      </Link>

      {campaigns.length > 0 && (
        <div className="mt-10">
          <SectionHeading title={dict.tr_campaign_transparency} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => <CampaignCard key={c.slug} c={c} dict={dict} />)}
          </div>
        </div>
      )}

      <div className="mt-10">
        <SectionHeading title={dict.tr_public_reports} />
        {reports.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((r) => (
              <Card key={r.id} className="p-5">
                <div className="text-xs text-saffron-700">{r.type} · {r.year}</div>
                <h3 className="mt-1 font-bold text-ink">{r.title}</h3>
                {r.summary && <p className="mt-1 text-sm text-stone-500">{r.summary}</p>}
                {r.pdfUrl && <a href={r.pdfUrl} target="_blank" className="mt-2 inline-block text-sm font-medium text-saffron-700">{dict.tr_view_pdf}</a>}
              </Card>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-saffron-200 p-6 text-center text-sm text-stone-500">
            {dict.tr_reports_coming_soon}
          </p>
        )}
      </div>
    </div>
  );
}
