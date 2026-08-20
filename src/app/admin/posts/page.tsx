import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card, Badge } from "@/components/ui/primitives";
import { formatDateHi } from "@/lib/utils";
import { DeletePostButton } from "@/components/admin/DeletePostButton";

export const dynamic = "force-dynamic";

const tone: Record<string, "green" | "amber" | "neutral" | "blue"> = {
  PUBLISHED: "green", DRAFT: "amber", SCHEDULED: "blue", ARCHIVED: "neutral",
};

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({ include: { category: true }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">गतिविधि पोस्ट ({posts.length})</h1>
        <Link href="/admin/posts/new" className="inline-flex items-center gap-1.5 rounded-xl bg-saffron-600 px-4 py-2 text-sm font-medium text-white hover:bg-saffron-700">
          <Plus className="h-4 w-4" /> नई पोस्ट
        </Link>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs text-stone-500">
            <tr><th className="px-4 py-3">शीर्षक</th><th className="px-4 py-3">श्रेणी</th><th className="px-4 py-3">स्थिति</th><th className="px-4 py-3">दिनांक</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-saffron-50/40">
                <td className="px-4 py-3 font-medium text-ink">{p.title} {p.featured && <Badge tone="saffron">Featured</Badge>}</td>
                <td className="px-4 py-3">{p.category?.name ?? "—"}</td>
                <td className="px-4 py-3"><Badge tone={tone[p.status] ?? "neutral"}>{p.status}</Badge></td>
                <td className="px-4 py-3 text-stone-500">{formatDateHi(p.date)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/posts/${p.id}`} className="text-saffron-700 text-xs font-medium hover:underline">संपादित करें</Link>
                    <DeletePostButton id={p.id} title={p.title} />
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-stone-400">कोई पोस्ट नहीं।</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
