/**
 * One-off: broken Devanagari slugs → ASCII `category-shortId`
 * Run: npx tsx scripts/fix-post-slugs.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    include: { category: { select: { slug: true } } },
  });
  let updated = 0;
  for (const p of posts) {
    const needsFix = /[^\x00-\x7F]/.test(p.slug) || p.slug.includes("--") || /[\u0900-\u097F]/.test(p.slug);
    if (!needsFix) continue;
    const base = p.category?.slug || "post";
    let next = `${base}-${p.id.slice(-6)}`;
    let n = 0;
    while (await prisma.post.findFirst({ where: { slug: next, NOT: { id: p.id } } })) {
      n++;
      next = `${base}-${p.id.slice(-6)}-${n}`;
    }
    await prisma.post.update({ where: { id: p.id }, data: { slug: next } });
    updated++;
    console.log(`${p.slug.slice(0, 40)}… → ${next}`);
  }
  console.log(`Done. Updated ${updated} / ${posts.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
