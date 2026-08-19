import { prisma } from "@/lib/db";
import { TeamSection, MentorSection } from "./PeopleManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "टीम व मार्गदर्शक — NYS Admin" };

export default async function PeoplePage() {
  const [team, mentors] = await Promise.all([
    prisma.teamMember.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.mentor.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink">टीम व मार्गदर्शक</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <TeamSection initialTeam={team} />
        <MentorSection initialMentors={mentors} />
      </div>
    </div>
  );
}
