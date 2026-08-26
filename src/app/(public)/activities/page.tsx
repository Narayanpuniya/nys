import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getI18n } from "@/lib/i18n";
import { ActivitiesFeed } from "@/components/public/ActivitiesFeed";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.activities_title, description: dict.activities_sub };
}
export const revalidate = 60;

export default async function ActivitiesPage() {
  const [categories, { dict }] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    getI18n(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="mb-2 h-1 w-16 rounded-full bg-gradient-to-r from-saffron-500 to-maroon-600" />
          <h1 className="text-2xl font-extrabold text-stone-900 sm:text-3xl">{dict.activities_title}</h1>
          <p className="mt-1 text-sm text-stone-500">{dict.activities_sub}</p>
        </div>
      </div>

      <ActivitiesFeed
        categories={categories.map((c) => ({ slug: c.slug, name: c.name, color: c.color }))}
        pageSize={12}
        height="h-[700px]"
        dict={dict}
      />
    </div>
  );
}
