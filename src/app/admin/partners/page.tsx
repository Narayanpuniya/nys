import { prisma } from "@/lib/db";
import { Card, Badge } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function AdminPartnersPage() {
  const partners = await prisma.partner.findMany({ include: { programs: true }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold text-ink">सहयोगी संस्थान ({partners.length})</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {partners.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-ink">{p.name}</h3>
              {p.featured && <Badge tone="saffron">Featured</Badge>}
            </div>
            {p.about && <p className="mt-1 line-clamp-2 text-sm text-stone-500">{p.about}</p>}
            <p className="mt-2 text-xs text-saffron-700">{p.programs.length} संयुक्त कार्यक्रम</p>
          </Card>
        ))}
        {partners.length === 0 && <p className="text-sm text-stone-400">कोई सहयोगी नहीं।</p>}
      </div>
    </div>
  );
}
