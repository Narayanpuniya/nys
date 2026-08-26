import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { getI18n } from "@/lib/i18n";
import { Card, SectionHeading, EmptyState } from "@/components/ui/primitives";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.team_title };
}
export const revalidate = 600;

export default async function TeamPage() {
  const [team, { dict }] = await Promise.all([
    prisma.teamMember.findMany({ orderBy: { sortOrder: "asc" } }),
    getI18n(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading title={dict.team_title} subtitle={dict.team_sub} />
      {team.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <Card key={m.id} className="p-5 text-center">
              <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-saffron-100 text-4xl">
                {m.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photoUrl} alt={m.name} className="h-full w-full object-cover" />
                ) : "🙏"}
              </div>
              <div className="inline-flex rounded-full bg-maroon-100 px-2.5 py-0.5 text-xs font-semibold text-maroon-800">
                {m.designation}
              </div>
              <h3 className="mt-1 font-bold text-ink">{m.name}</h3>
              {m.responsibility && <p className="mt-1 text-xs text-stone-500">{m.responsibility}</p>}
              {m.showMobile && m.mobile && (
                <a href={`tel:${m.mobile}`} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-saffron-700">
                  <Phone className="h-4 w-4" /> {dict.call}
                </a>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState message={dict.team_none} />
      )}
    </div>
  );
}
