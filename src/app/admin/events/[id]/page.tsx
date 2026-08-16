import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/primitives";
import { EventForm } from "@/components/admin/EventForm";
import { formatDateHi } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id }, include: { registrations: { orderBy: { createdAt: "desc" }, take: 50 } } });
  if (!event) notFound();

  return (
    <div>
      <Link href="/admin/events" className="text-sm text-saffron-700">← सभी कार्यक्रम</Link>
      <h1 className="mb-4 mt-2 text-2xl font-extrabold text-ink">कार्यक्रम संपादित करें</h1>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2"><EventForm event={event} /></Card>
        <Card className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-ink">पंजीकरण ({event.registrations.length})</h3>
            <a href={`/api/admin/export/participants?eventId=${event.id}`} className="text-xs text-green-700">Excel ↓</a>
          </div>
          <div className="max-h-96 space-y-2 overflow-y-auto nys-scroll">
            {event.registrations.map((r) => (
              <div key={r.id} className="rounded-lg bg-stone-50 p-2 text-sm">
                <div className="font-medium text-ink">{r.name}</div>
                <div className="text-xs text-stone-400">{r.mobile} · {r.participants} · {formatDateHi(r.createdAt)}</div>
              </div>
            ))}
            {event.registrations.length === 0 && <p className="text-sm text-stone-400">कोई पंजीकरण नहीं।</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
