import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/primitives";
import { CampaignForm } from "@/components/admin/CampaignForm";
import { inputClass } from "@/components/ui/primitives";
import { addCampaignUpdate } from "../actions";
import { formatDateHi } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id }, include: { updates: { orderBy: { createdAt: "desc" } } } });
  if (!campaign) notFound();

  return (
    <div>
      <Link href="/admin/campaigns" className="text-sm text-saffron-700">← सभी अभियान</Link>
      <h1 className="mb-4 mt-2 text-2xl font-extrabold text-ink">अभियान संपादित करें</h1>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2"><CampaignForm campaign={campaign} /></Card>
        <Card className="p-6">
          <h3 className="mb-3 font-bold text-ink">अभियान अपडेट जोड़ें</h3>
          <form action={addCampaignUpdate.bind(null, campaign.id)} className="space-y-2">
            <input name="title" placeholder="शीर्षक" className={inputClass} required />
            <textarea name="body" placeholder="विवरण" rows={3} className={inputClass} required />
            <button className="w-full rounded-xl bg-saffron-600 py-2 text-sm font-medium text-white">जोड़ें</button>
          </form>
          <div className="mt-4 space-y-2">
            {campaign.updates.map((u) => (
              <div key={u.id} className="rounded-lg bg-stone-50 p-2 text-sm">
                <div className="font-medium text-ink">{u.title}</div>
                <div className="text-xs text-stone-400">{formatDateHi(u.createdAt)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
