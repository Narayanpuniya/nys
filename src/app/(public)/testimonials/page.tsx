import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getI18n } from "@/lib/i18n";
import { Quote } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.testimonials_title ?? "Testimonials — NYS" };
}

export default async function TestimonialsPage() {
  const { dict } = await getI18n();
  const items = await prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Heading */}
      <div className="mb-10 text-center">
        <div className="mb-3 h-1 w-16 rounded-full bg-gradient-to-r from-saffron-500 to-maroon-600 mx-auto" />
        <h1 className="text-3xl font-extrabold text-stone-900">
          {dict.testimonials_title ?? "Testimonials"}
        </h1>
        <p className="mt-2 text-stone-500">
          {dict.testimonials_sub ?? "What people say about Narayanpuri Youth Society"}
        </p>
      </div>

      {items.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-stone-200 py-20 text-center text-stone-400">
          <Quote className="mx-auto mb-3 h-12 w-12 opacity-30" />
          <p>No testimonials yet.</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {items.map(t => (
          <div key={t.id}
            className="relative rounded-2xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            {/* Quote mark decoration */}
            <Quote className="absolute top-4 right-4 h-8 w-8 text-saffron-100" />

            {/* Person */}
            <div className="flex items-center gap-4 mb-4">
              {t.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.photoUrl} alt={t.name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-saffron-200 flex-shrink-0" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-saffron-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-saffron-600">{t.name[0]}</span>
                </div>
              )}
              <div>
                <h3 className="font-bold text-stone-900">{t.name}</h3>
                {t.designation && (
                  <p className="text-sm text-saffron-700 font-medium">{t.designation}</p>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="relative pl-4 border-l-4 border-saffron-300">
              <p className="text-stone-600 leading-relaxed text-sm">{t.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
