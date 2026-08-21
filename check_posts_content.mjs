import { PrismaClient } from '@prisma/client';
const neon = new PrismaClient({
  datasources: { db: { url: 'postgresql://neondb_owner:npg_1bsXTYeRan0O@ep-billowing-mode-ayvdju06-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' } }
});

const posts = await neon.post.findMany({
  orderBy: { date: 'desc' },
  select: { id: true, title: true, mainImage: true, images: true, date: true }
});

console.log('=== POSTS WITHOUT PHOTOS ===\n');
const missing = posts.filter(p => !p.mainImage && !p.images);
for (const p of missing) {
  console.log(`❌ [${p.date?.toISOString().substring(0,10)}] ${p.title}`);
}

console.log('\n=== POSTS WITH PHOTOS ===\n');
const hasPhoto = posts.filter(p => p.mainImage || p.images);
for (const p of hasPhoto) {
  let extras = 0;
  try { if(p.images) extras = JSON.parse(p.images).length; } catch {}
  console.log(`✅ [${p.date?.toISOString().substring(0,10)}] ${p.title.substring(0,55)} [main:${!!p.mainImage} +${extras}]`);
}

console.log(`\nTotal: ${posts.length} | With photo: ${hasPhoto.length} | Missing: ${missing.length}`);
await neon.$disconnect();
