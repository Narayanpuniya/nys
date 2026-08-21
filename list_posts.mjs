import { PrismaClient } from '@prisma/client';
const neon = new PrismaClient({
  datasources: { db: { url: 'postgresql://neondb_owner:npg_1bsXTYeRan0O@ep-billowing-mode-ayvdju06-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' } }
});

const posts = await neon.post.findMany({
  where: { status: 'PUBLISHED' },
  select: { title: true, mainImage: true, images: true, date: true, slug: true },
  orderBy: { date: 'desc' }
});

console.log('\n📸 POSTS WITH BROKEN IMAGES (need re-upload):');
let n = 1;
for (const p of posts) {
  const hasMain = !!p.mainImage;
  let extraCount = 0;
  try { if (p.images) extraCount = JSON.parse(p.images).length; } catch {}
  if (hasMain || extraCount > 0) {
    console.log(`${n++}. [${p.date.toISOString().slice(0,10)}] ${p.title.slice(0,65)}`);
    console.log(`   main: ${p.mainImage || 'none'} | extra: ${extraCount}`);
  }
}
console.log(`\n❌ POSTS WITHOUT ANY PHOTO:`);
for (const p of posts) {
  if (!p.mainImage && !p.images) {
    console.log(`   [${p.date.toISOString().slice(0,10)}] ${p.title.slice(0,65)}`);
  }
}

await neon.$disconnect();
