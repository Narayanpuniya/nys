import { PrismaClient } from '@prisma/client';
const neon = new PrismaClient({
  datasources: { db: { url: 'postgresql://neondb_owner:npg_1bsXTYeRan0O@ep-billowing-mode-ayvdju06-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' } }
});

const items = await neon.galleryItem.findMany({ orderBy: { date: 'desc' } });
console.log(`\nGalleryItem table — total: ${items.length}\n`);
items.forEach((g, i) => {
  console.log(`${i+1}. [${g.date.toISOString().slice(0,10)}] cat: "${g.category}" | title: "${g.title||'(none)'}" | url: ${g.imageUrl}`);
  console.log(`   id: ${g.id}`);
});
await neon.$disconnect();
