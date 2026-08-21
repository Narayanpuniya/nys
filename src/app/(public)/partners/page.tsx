import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, SectionHeading, EmptyState } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "सहयोगी संस्थान" };
export const revalidate = 600;

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: { programs: true },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading title="हमारे सहयोगी संस्थान" subtitle="जिनके सहयोग से हमारे सामाजिक कार्य संभव हैं" />
      {partners.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((p) => (
            <Link key={p.id} href={`/partners/${p.slug}`}>
              <Card className="h-full p-6 transition hover:shadow-md">
                <div className="flex h-16 items-center">
                  {p.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logoUrl} alt={p.name} className="max-h-16 object-contain" />
                  ) : (
                    <span className="text-lg font-bold text-ink">{p.name}</span>
                  )}
                </div>
                {p.about && <p className="mt-3 line-clamp-2 text-sm text-stone-600">{p.about}</p>}
                {p.programs.length > 0 && (
                  <p className="mt-2 text-xs font-medium text-saffron-700">{p.programs.length} संयुक्त कार्यक्रम →</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState message="सहयोगी संस्थानों की जानकारी शीघ्र उपलब्ध होगी।" />
      )}
    </div>
  );
}
