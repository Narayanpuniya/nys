import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getCampaignProgress } from "@/lib/stats";
import { formatINR, formatDateHi } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card, Badge, SectionHeading } from "@/components/ui/primitives";
import { DonateForm } from "@/components/public/DonateForm";
import { ShareButtons } from "@/components/public/ShareButtons";
import { Users, MapPin, Target } from "lucide-react";
import { getSettings } from "@/lib/settings";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = await prisma.campaign.findUnique({ where: { slug } });
  return { title: c?.title ?? "अभियान", description: c?.description?.slice(0, 150) };
}

export default async function CampaignDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [campaign, s] = await Promise.all([
    prisma.campaign.findUnique({
      where: { slug },
      include: { updates: { orderBy: { createdAt: "desc" } } },
    }),
    getSettings(),
  ]);
  if (!campaign) notFound();

  const p = await getCampaignProgress(campaign.id);
  const achieved = p.percent >= 100;
  const acceptsDonation = campaign.status === "ACTIVE" || (achieved && campaign.acceptAfterGoal);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Left: details */}
        <div className="lg:col-span-3">
          <div
            className="mb-5 flex h-56 items-center justify-center rounded-2xl bg-gradient-to-br from-saffron-100 to-maroon-100 text-6xl"
            style={campaign.coverImage ? { backgroundImage: `url(${campaign.coverImage})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          >
            {!campaign.coverImage && "🎯"}
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={achieved ? "green" : "saffron"}>{achieved ? "लक्ष्य प्राप्त" : "सक्रिय"}</Badge>
            {campaign.category && <Badge tone="neutral">{campaign.category}</Badge>}
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">{campaign.title}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-stone-500">
            {campaign.location && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {campaign.location}</span>}
            {campaign.beneficiary && <span className="inline-flex items-center gap-1"><Target className="h-4 w-4" /> {campaign.beneficiary}</span>}
            {campaign.endDate && <span>समाप्ति: {formatDateHi(campaign.endDate)}</span>}
          </div>

          <p className="mt-4 whitespace-pre-line text-stone-700">{campaign.description}</p>

          <div className="mt-4">
            <ShareButtons url={`/campaigns/${campaign.slug}`} text={`NYS अभियान: ${campaign.title}`} />
          </div>

          {/* Updates */}
          {campaign.updates.length > 0 && (
            <div className="mt-10">
              <SectionHeading title="अभियान अपडेट्स" />
              <div className="space-y-3">
                {campaign.updates.map((u) => (
                  <Card key={u.id} className="p-4">
                    <div className="text-xs text-stone-400">{formatDateHi(u.createdAt)}</div>
                    <h3 className="font-semibold text-ink">{u.title}</h3>
                    <p className="mt-1 text-sm text-stone-600">{u.body}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: progress + donate */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">
            <Card className="p-6">
              <ProgressBar percent={p.percent} />
              <div className="mt-4 space-y-3">
                <Stat label="प्राप्त" value={formatINR(p.collected)} big />
                <div className="grid grid-cols-2 gap-3">
                  <Stat label="लक्ष्य" value={formatINR(p.goal)} />
                  <Stat label="अभी आवश्यकता" value={formatINR(p.remaining)} />
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <Users className="h-4 w-4" /> {p.donors} दानदाता · {p.percent}% पूर्ण
                </div>
              </div>
            </Card>

            {achieved && (
              <div className="rounded-2xl bg-green-600 p-4 text-center font-bold text-white">
                🎉 TARGET ACHIEVED — धन्यवाद!
              </div>
            )}

            {acceptsDonation ? (
              <Card className="p-6">
                <h3 className="mb-3 font-bold text-ink">इस अभियान में सहयोग करें</h3>
                <DonateForm
                  purposes={[{ key: "CAMPAIGN", label: campaign.title }]}
                  campaignId={campaign.id}
                  campaignTitle={campaign.title}
                  bank={{
                    accountName: s.bank.accountName,
                    bankName: s.bank.bankName,
                    accountNumber: s.bank.accountNumber,
                    ifsc: s.bank.ifsc,
                    branch: s.bank.branch,
                    upiId: s.bank.upiId,
                    upiQrUrl: s.bank.upiQrUrl,
                  }}
                />
              </Card>
            ) : (
              <Card className="p-6 text-center text-sm text-stone-500">
                यह अभियान अब दान स्वीकार नहीं कर रहा है।
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div>
      <div className="text-xs text-stone-500">{label}</div>
      <div className={big ? "text-2xl font-extrabold text-saffron-800" : "font-bold text-ink"}>{value}</div>
    </div>
  );
}
