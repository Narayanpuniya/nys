import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card, SectionHeading } from "@/components/ui/primitives";
import { formatNumber } from "@/lib/utils";

export const revalidate = 600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.partner.findUnique({ where: { slug } });
  return { title: p?.name ?? "सहयोगी संस्थान" };
}

export default async function PartnerDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const partner = await prisma.partner.findUnique({ where: { slug }, include: { programs: true } });
  if (!partner) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Card className="p-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-saffron-50">
            {partner.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={partner.logoUrl} alt={partner.name} className="max-h-20 object-contain" />
            ) : <span className="text-2xl font-bold">{partner.name.slice(0, 2)}</span>}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-ink">{partner.name}</h1>
            {partner.website && (
              <a href={partner.website} target="_blank" className="mt-1 inline-flex items-center gap-1 text-sm text-saffron-700">
                <ExternalLink className="h-4 w-4" /> वेबसाइट
              </a>
            )}
          </div>
        </div>
        {partner.about && <p className="mt-6 text-stone-700">{partner.about}</p>}
        {partner.contribution && (
          <p className="mt-3 rounded-xl bg-saffron-50 p-3 text-sm text-saffron-900">
            <span className="font-semibold">NYS के साथ योगदान: </span>{partner.contribution}
          </p>
        )}
      </Card>

      {partner.programs.length > 0 && (
        <div className="mt-8">
          <SectionHeading title="NYS के साथ सहयोग" />
          <div className="grid gap-4 sm:grid-cols-3">
            {partner.programs.map((pr) => (
              <Card key={pr.id} className="p-5 text-center">
                {pr.impactValue != null && (
                  <div className="text-3xl font-extrabold text-saffron-800">{formatNumber(pr.impactValue)}</div>
                )}
                <div className="text-xs text-stone-500">{pr.impactLabel}</div>
                <div className="mt-2 text-sm font-medium text-ink">{pr.title}</div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
