import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/primitives";
import { PostForm } from "@/components/admin/PostForm";
import { deletePost } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!post) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link href="/admin/posts" className="text-sm text-saffron-700">← सभी पोस्ट</Link>
        <form action={deletePost.bind(null, post.id)}>
          <button className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">संग्रहित करें</button>
        </form>
      </div>
      <h1 className="mb-4 mt-2 text-2xl font-extrabold text-ink">पोस्ट संपादित करें</h1>
      <Card className="p-6"><PostForm post={post} categories={categories} /></Card>
    </div>
  );
}
