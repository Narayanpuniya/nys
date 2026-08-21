import { PrismaClient } from '@prisma/client';
const neon = new PrismaClient({
  datasources: { db: { url: 'postgresql://neondb_owner:npg_1bsXTYeRan0O@ep-billowing-mode-ayvdju06-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' } }
});

// 1. Posts from Aug 19, 2026
const aug19 = await neon.post.findMany({
  where: {
    date: {
      gte: new Date('2026-08-19T00:00:00Z'),
      lte: new Date('2026-08-19T23:59:59Z')
    }
  },
  select: { id: true, title: true, status: true, mainImage: true, category: { select: { name: true, slug: true } } }
});
console.log(`\n=== Aug 19, 2026 posts (${aug19.length}) ===`);
aug19.forEach(p => console.log(`  [${p.status}] "${p.title}" | cat: ${p.category?.name||'none'} | img: ${p.mainImage||'NONE'}\n  id: ${p.id}`));

// 2. All posts without photos
const noPhoto = await neon.post.findMany({
  where: { OR: [{ mainImage: null }, { mainImage: '' }] },
  select: { id: true, title: true, status: true, date: true, category: { select: { name: true, slug: true } } },
  orderBy: { date: 'desc' }
});
console.log(`\n=== Posts without mainImage (${noPhoto.length}) ===`);
noPhoto.forEach(p => console.log(`  [${p.status}] [${p.date.toISOString().slice(0,10)}] "${p.title}" | cat: ${p.category?.name||'none'}\n  id: ${p.id}`));

// 3. All categories in DB
const cats = await neon.category.findMany({ select: { name: true, slug: true, _count: { select: { posts: true } } } });
console.log(`\n=== All categories ===`);
cats.forEach(c => console.log(`  ${c.name} (${c.slug}) — ${c._count.posts} posts`));

// 4. Any DRAFT posts
const drafts = await neon.post.findMany({
  where: { status: 'DRAFT' },
  select: { id: true, title: true, date: true, category: { select: { name: true } } },
  orderBy: { createdAt: 'desc' }
});
console.log(`\n=== DRAFT posts (${drafts.length}) ===`);
drafts.forEach(p => console.log(`  [${p.date.toISOString().slice(0,10)}] "${p.title}" | cat: ${p.category?.name||'none'}\n  id: ${p.id}`));

await neon.$disconnect();
