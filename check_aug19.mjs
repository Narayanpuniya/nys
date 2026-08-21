import { PrismaClient } from '@prisma/client';
const neon = new PrismaClient({
  datasources: { db: { url: 'postgresql://neondb_owner:npg_1bsXTYeRan0O@ep-billowing-mode-ayvdju06-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' } }
});

// Posts WITHOUT photos (any status)
const nophoto = await neon.post.findMany({
  where: { OR: [{ mainImage: null }, { mainImage: '' }] },
  select: { id: true, title: true, date: true, status: true, mainImage: true },
  orderBy: { createdAt: 'desc' }
});

console.log(`\nPosts without mainImage (${nophoto.length}):\n`);
nophoto.forEach((p, i) => {
  console.log(`${i+1}. [${p.date.toISOString().slice(0,10)}] [${p.status}] ${p.title.slice(0,65)}`);
  console.log(`   id: ${p.id}`);
});

await neon.$disconnect();
