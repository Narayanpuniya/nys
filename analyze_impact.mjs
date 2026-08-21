import { PrismaClient } from '@prisma/client';
const neon = new PrismaClient({
  datasources: { db: { url: 'postgresql://neondb_owner:npg_1bsXTYeRan0O@ep-billowing-mode-ayvdju06-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' } }
});

const posts = await neon.post.findMany({
  where: { status: 'PUBLISHED' },
  select: { id: true, title: true, impactNumber: true, impactLabel: true, category: { select: { name: true, slug: true } }, date: true },
  orderBy: { date: 'desc' }
});

const byCat = {};
for (const p of posts) {
  const slug = p.category?.slug || 'none';
  if (!byCat[slug]) byCat[slug] = [];
  byCat[slug].push(p);
}

for (const [slug, list] of Object.entries(byCat)) {
  console.log(`\n=== ${slug} (${list.length} posts) ===`);
  list.forEach(p => {
    const impact = p.impactNumber ? `[impact: ${p.impactNumber} ${p.impactLabel||''}]` : '[no impact]';
    console.log(`  ${p.date.toISOString().slice(0,10)} | ${p.title.slice(0,55)} ${impact}`);
    console.log(`    id: ${p.id}`);
  });
}

await neon.$disconnect();
