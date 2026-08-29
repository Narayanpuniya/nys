import { prisma } from "@/lib/db";
import { TestimonialsManager } from "./TestimonialsManager";

export const dynamic = "force-dynamic";

export default async function TestimonialsAdminPage() {
  const raw = await prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const items = raw.map(t => ({
    id: t.id,
    name: t.name,
    designation: t.designation,
    message: t.message,
    photoUrl: t.photoUrl,
    isPublished: t.isPublished,
    sortOrder: t.sortOrder,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <TestimonialsManager initial={items} />
    </div>
  );
}
