import Link from "next/link";
import { Plus, Download } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card, Badge } from "@/components/ui/primitives";
import { formatDateHi } from "@/lib/utils";
import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
    include: { _count: { select: { registrations: true } } },
  });
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">कार्यक्रम ({events.length})</h1>
        <Link href="/admin/events/new" className="inline-flex items-center gap-1.5 rounded-xl bg-saffron-600 px-4 py-2 text-sm font-medium text-white"><Plus className="h-4 w-4" /> नया कार्यक्रम</Link>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs text-stone-500">
            <tr><th className="px-4 py-3">शीर्षक</th><th className="px-4 py-3">दिनांक</th><th className="px-4 py-3">स्थिति</th><th className="px-4 py-3">पंजीकरण</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-saffron-50/40">
                <td className="px-4 py-3 font-medium text-ink">{e.title}</td>
                <td className="px-4 py-3 text-stone-500">{formatDateHi(e.date)}</td>
                <td className="px-4 py-3"><Badge tone={e.status === "UPCOMING" ? "amber" : e.status === "COMPLETED" ? "blue" : "neutral"}>{e.status}</Badge></td>
                <td className="px-4 py-3">{e._count.registrations}{e.maxParticipants ? `/${e.maxParticipants}` : ""}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/events/${e.id}`} className="text-saffron-700 hover:underline">संपादित</Link>
                    {e._count.registrations > 0 && (
                      <a href={`/api/admin/export/participants?eventId=${e.id}`} className="inline-flex items-center gap-1 text-green-700"><Download className="h-3.5 w-3.5" />सूची</a>
                    )}
                    <AdminDeleteButton entity="event" id={e.id} label={e.title} />
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-stone-400">कोई कार्यक्रम नहीं।</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
