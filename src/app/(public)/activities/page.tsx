import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ActivitiesFeed } from "@/components/public/ActivitiesFeed";

export const metadata: Metadata = {
  title: "ताज़ा NYS गतिविधियाँ",
  description: "NYS की शिक्षा, खेल, पर्यावरण, सामाजिक सेवा और Craft & Heritage से जुड़ी नवीनतम खबरें",
};
export const revalidate = 60;

export default async function ActivitiesPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* ── News portal style section header ── */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          {/* Accent line above heading */}
          <div className="mb-2 h-1 w-16 rounded-full bg-gradient-to-r from-saffron-500 to-maroon-600" />
          <h1 className="text-2xl font-extrabold text-stone-900 sm:text-3xl">ताज़ा NYS गतिविधियाँ</h1>
          <p className="mt-1 text-sm text-stone-500">
            NYS की शिक्षा, खेल, पर्यावरण, सामाजिक सेवा और Craft &amp; Heritage से जुड़ी नवीनतम खबरें
          </p>
        </div>
      </div>

      <ActivitiesFeed
        categories={categories.map((c) => ({ slug: c.slug, name: c.name, color: c.color }))}
        pageSize={12}
        height="h-[700px]"
      />
    </div>
  );
}
