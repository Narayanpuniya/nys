import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ActivitiesFeed } from "@/components/public/ActivitiesFeed";
import { ActivityCategories } from "@/components/public/ActivityCategories";
import { SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "गतिविधियाँ" };
export const revalidate = 60;

export default async function ActivitiesPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeading title="NYS गतिविधियाँ" subtitle="हमारे सभी कार्यक्रम एवं पहल एक जगह।" />
      <div className="mb-8">
        <ActivityCategories categories={categories} />
      </div>
      <ActivitiesFeed
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        pageSize={10}
        height="h-[700px]"
      />
    </div>
  );
}
