import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Card, SectionHeading, EmptyState } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "हमारे मार्गदर्शक" };
export const revalidate = 600; // 10 min

export default async function MentorsPage() {
  const mentors = await prisma.mentor.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading title="हमारे मार्गदर्शक / Mentors" subtitle="जिनके अनुभव व मार्गदर्शन से NYS आगे बढ़ता है" />
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
                <p className="mt-2 text-sm text-stone-500"><span className="font-medium text-ink">योगदान: </span>{m.contribution}</p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState message="मार्गदर्शकों की जानकारी शीघ्र उपलब्ध होगी।" />
      )}
    </div>
  );
}
