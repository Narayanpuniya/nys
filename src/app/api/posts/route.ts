import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// Public posts feed API (mobile app भी इसी endpoint का उपयोग कर सकता है)।
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(sp.get("pageSize") || "8", 10)));
  const q = (sp.get("q") || "").trim();
  const category = (sp.get("category") || "").trim();

  const where: Prisma.PostWhereInput = {
    status: "PUBLISHED",
    ...(category ? { category: { slug: category } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { excerpt: { contains: q } },
            { location: { contains: q } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: true },
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({
    total,
    page,
    pageSize,
    items: items.map((p) => ({
      slug: p.slug,
      title: p.title,
      date: p.date.toISOString(),
      location: p.location,
      excerpt: p.excerpt,
      mainImage: p.mainImage,
      categoryName: p.category?.name ?? null,
      categoryColor: p.category?.color ?? null,
      impactNumber: p.impactNumber,
      impactLabel: p.impactLabel,
    })),
  });
}
