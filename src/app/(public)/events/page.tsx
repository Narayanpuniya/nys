import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { EventCard } from "@/components/public/EventCard";
import { SectionHeading, EmptyState } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "कार्यक्रम (Events)" };
export const revalidate = 60;

export default async function EventsPage() {
  const events = await prisma.event.findMany({ orderBy: { date: "desc" } });
  const upcoming = events.filter((e) => e.status === "UPCOMING" || e.status === "ONGOING");
  const past = events.filter((e) => e.status === "COMPLETED" || e.status === "CANCELLED");

  const map = (e: (typeof events)[number]) => ({
    slug: e.slug, title: e.title, date: e.date.toISOString(), time: e.time,
    venue: e.venue, posterImage: e.posterImage, status: e.status, category: e.category,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <SectionHeading title="आगामी कार्यक्रम" />
      {upcoming.length ? (
        <div className="space-y-3">{upcoming.map((e) => <EventCard key={e.id} e={map(e)} />)}</div>
      ) : (
        <EmptyState message="फिलहाल कोई आगामी कार्यक्रम उपलब्ध नहीं है।" />
      )}

      {past.length > 0 && (
        <div className="mt-12">
          <SectionHeading title="पूर्व कार्यक्रम" />
          <div className="space-y-3">{past.map((e) => <EventCard key={e.id} e={map(e)} />)}</div>
        </div>
      )}
    </div>
  );
}
