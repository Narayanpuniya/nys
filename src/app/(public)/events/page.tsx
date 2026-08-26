import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getI18n } from "@/lib/i18n";
import { EventCard } from "@/components/public/EventCard";
import { SectionHeading, EmptyState } from "@/components/ui/primitives";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.events_title };
}
export const revalidate = 60;

export default async function EventsPage() {
  const [events, { dict }] = await Promise.all([
    prisma.event.findMany({ orderBy: { date: "desc" } }),
    getI18n(),
  ]);
  const upcoming = events.filter((e) => e.status === "UPCOMING" || e.status === "ONGOING");
  const past = events.filter((e) => e.status === "COMPLETED" || e.status === "CANCELLED");

  const map = (e: (typeof events)[number]) => ({
    slug: e.slug, title: e.title, date: e.date.toISOString(), time: e.time,
    venue: e.venue, posterImage: e.posterImage, status: e.status, category: e.category,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <SectionHeading title={dict.events_title} />
      {upcoming.length ? (
        <div className="space-y-3">{upcoming.map((e) => <EventCard key={e.id} e={map(e)} dict={dict} />)}</div>
      ) : (
        <EmptyState message={dict.events_none} />
      )}

      {past.length > 0 && (
        <div className="mt-12">
          <SectionHeading title={dict.events_past} />
          <div className="space-y-3">{past.map((e) => <EventCard key={e.id} e={map(e)} dict={dict} />)}</div>
        </div>
      )}
    </div>
  );
}
