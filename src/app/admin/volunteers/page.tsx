import { prisma } from "@/lib/db";
import { Card, Badge } from "@/components/ui/primitives";
import { formatDateHi, safeJsonParse } from "@/lib/utils";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";

export const dynamic = "force-dynamic";

export default async function VolunteersPage() {
  const items = await prisma.volunteer.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold text-ink">स्वयंसेवक ({items.length})</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((v) => {
          const areas = safeJsonParse<string[]>(v.areas, []);
          return (
            <Card key={v.id} className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-ink">{v.name}</h3>
                <Badge tone={v.status === "NEW" ? "amber" : "green"}>{v.status}</Badge>
              </div>
              {v.mobile && <p className="text-sm text-stone-500">{v.mobile}</p>}
              <div className="mt-2 flex flex-wrap gap-1">
                {areas.map((a) => <span key={a} className="rounded-full bg-saffron-50 px-2 py-0.5 text-xs text-saffron-800">{a}</span>)}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-stone-400">{formatDateHi(v.createdAt)}</p>
                <AdminDeleteButton entity="volunteer" id={v.id} label={v.name} />
              </div>
            </Card>
          );
        })}
        {items.length === 0 && <p className="text-sm text-stone-400">कोई स्वयंसेवक नहीं।</p>}
      </div>
    </div>
  );
}
