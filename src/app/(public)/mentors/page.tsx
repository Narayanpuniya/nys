import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getI18n } from "@/lib/i18n";
import { Card, SectionHeading, EmptyState } from "@/components/ui/primitives";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.mentors_title };
}
export const revalidate = 600;

export default async function MentorsPage() {
  const [mentors, { dict }] = await Promise.all([
    prisma.mentor.findMany({ orderBy: { sortOrder: "asc" } }),
    getI18n(),
  ]);


  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading title={dict.mentors_title} subtitle={dict.mentors_sub} />
      {mentors.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mentors.map((m) => (
            <Card key={m.id} className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-saffron-100 text-3xl">
                  {m.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photoUrl} alt={m.name} className="h-full w-full object-cover" />
                  ) : "🧑‍🏫"}
                </div>
                <div>
                  <h3 className="font-bold text-ink">{m.name}</h3>
                  {m.designation && <p className="text-sm text-saffron-700">{m.designation}</p>}
                  {m.profession && <p className="text-xs text-stone-500">{m.profession}</p>}
                </div>
              </div>
              {m.intro && <p className="mt-3 text-sm text-stone-600">{m.intro}</p>}
              {m.contribution && (
                <p className="mt-2 text-sm text-stone-500">
                  <span className="font-medium text-ink">{dict.mentor_contribution} </span>{m.contribution}
                </p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState message={dict.mentors_none} />
      )}
    </div>
  );
}
