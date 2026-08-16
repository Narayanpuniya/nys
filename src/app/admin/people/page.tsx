import { prisma } from "@/lib/db";
import { Card, Badge } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const [team, mentors] = await Promise.all([
    prisma.teamMember.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.mentor.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold text-ink">टीम व मार्गदर्शक</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 font-bold text-ink">टीम ({team.length})</h3>
          <ul className="space-y-2">
            {team.map((t) => (
              <li key={t.id} className="flex items-center justify-between text-sm">
                <span className="text-ink">{t.name}</span>
                <span className="flex items-center gap-2"><span className="text-stone-500">{t.designation}</span>{t.isLeadership && <Badge tone="saffron">नेतृत्व</Badge>}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 font-bold text-ink">मार्गदर्शक ({mentors.length})</h3>
          <ul className="space-y-2">
            {mentors.map((m) => (
              <li key={m.id} className="flex items-center justify-between text-sm">
                <span className="text-ink">{m.name}</span>
                <span className="text-stone-500">{m.designation ?? m.profession}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <p className="mt-4 text-sm text-stone-400">नोट: टीम/मार्गदर्शक जोड़ने/संपादित करने का फॉर्म भविष्य में; अभी seed/DB से प्रबंधित।</p>
    </div>
  );
}
