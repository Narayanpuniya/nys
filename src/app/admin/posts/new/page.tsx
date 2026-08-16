import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/primitives";
import { PostForm } from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <Link href="/admin/posts" className="text-sm text-saffron-700">← सभी पोस्ट</Link>
      <h1 className="mb-4 mt-2 text-2xl font-extrabold text-ink">नई गतिविधि पोस्ट</h1>
      <Card className="p-6"><PostForm categories={categories} /></Card>
    </div>
  );
}
