import Link from "next/link";
import { Plus } from "lucide-react";
import { listCampaignsWithProgress } from "@/lib/campaigns";
import { prisma } from "@/lib/db";
import { Card, Badge } from "@/components/ui/primitives";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  const all = await prisma.campaign.findMany({ orderBy: { createdAt: "desc" } });
  const progress = await listCampaignsWithProgress({ status: undefined });
  const map = new Map(progress.map((p) => [p.slug, p]));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">अभियान ({all.length})</h1>
        <Link href="/admin/campaigns/new" className="inline-flex items-center gap-1.5 rounded-xl bg-saffron-600 px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> नया अभियान</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {all.map((c) => {
          const p = map.get(c.slug);
          return (
            <Card key={c.id} className="p-5">
              <div className="flex items-center justify-between">
                <Badge tone={c.status === "ACTIVE" ? "green" : c.status === "COMPLETED" ? "blue" : "neutral"}>{c.status}</Badge>
                {c.featured && <Badge tone="saffron">Featured</Badge>}
              </div>
              <h3 className="mt-2 font-bold text-ink">{c.title}</h3>
              {p && (
                <div className="mt-3">
                  <ProgressBar percent={p.percent} />
                  <div className="mt-1 flex justify-between text-xs text-stone-500">
                    <span>{formatINR(p.collected)}</span><span>{formatINR(p.goal)}</span>
                  </div>
                </div>
              )}
              <div className="mt-3 flex gap-2 text-sm">
                <Link href={`/admin/campaigns/${c.id}`} className="text-saffron-700">संपादित/अपडेट</Link>
                <Link href={`/campaigns/${c.slug}`} target="_blank" className="text-stone-500">देखें ↗</Link>
              </div>
            </Card>
          );
        })}
        {all.length === 0 && <p className="text-sm text-stone-400">कोई अभियान नहीं।</p>}
      </div>
    </div>
  );
}
