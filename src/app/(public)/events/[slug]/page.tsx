import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarDays, Clock, MapPin, Phone, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDateHi } from "@/lib/utils";
import { Card, Badge, SectionHeading } from "@/components/ui/primitives";
import { EventRegisterForm } from "@/components/public/EventRegisterForm";
import { ShareButtons } from "@/components/public/ShareButtons";

export const revalidate = 30;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = await prisma.event.findUnique({ where: { slug } });
  return { title: e?.title ?? "कार्यक्रम", description: e?.description?.slice(0, 150) };
}

export default async function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    include: { _count: { select: { registrations: true } } },
  });
  if (!event) notFound();

  const full = event.maxParticipants ? event._count.registrations >= event.maxParticipants : false;
  const canRegister = event.registrationRequired && event.status === "UPCOMING" && !full;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {event.posterImage ? (
            <div className="mb-4 overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={event.posterImage} alt={event.title} className="w-full max-h-96 object-cover" />
            </div>
          ) : (
            <div className="mb-4 flex h-56 items-center justify-center rounded-2xl bg-gradient-to-br from-saffron-100 to-maroon-100 text-6xl">📅</div>
          )}
          <Badge tone="amber">{event.category}</Badge>
          <h1 className="mt-2 text-3xl font-extrabold text-ink">{event.title}</h1>
          <div className="mt-3 grid gap-2 text-sm text-stone-600 sm:grid-cols-2">
            <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-saffron-600" /> {formatDateHi(event.date)}</span>
            {event.time && <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-saffron-600" /> {event.time}</span>}
            {event.venue && <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-saffron-600" /> {event.venue}</span>}
            {event.contactNumber && <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-saffron-600" /> {event.contactPerson}: {event.contactNumber}</span>}
          </div>
          <p className="mt-4 whitespace-pre-line text-stone-700">{event.description}</p>
          {event.mapUrl && (
            <a href={event.mapUrl} target="_blank" className="mt-3 inline-block text-sm font-medium text-saffron-700">📍 Google Map पर देखें</a>
          )}
          <div className="mt-6">
            <ShareButtons url={`/events/${event.slug}`} text={`NYS कार्यक्रम: ${event.title}`} />
          </div>
        </div>

        <div>
          <div className="sticky top-24 space-y-4">
            {event.maxParticipants && (
              <Card className="p-4 text-sm">
                <span className="inline-flex items-center gap-2 text-stone-600">
                  <Users className="h-4 w-4" /> {event._count.registrations}/{event.maxParticipants} पंजीकृत
                </span>
              </Card>
            )}
            <Card className="p-6">
              <SectionHeading title="पंजीकरण" />
              {canRegister ? (
                <EventRegisterForm eventId={event.id} />
              ) : (
                <p className="text-sm text-stone-500">
                  {full ? "पंजीकरण पूर्ण हो चुका है।" : event.registrationRequired ? "पंजीकरण अभी उपलब्ध नहीं।" : "इस कार्यक्रम में पंजीकरण आवश्यक नहीं है — सभी आमंत्रित हैं।"}
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
