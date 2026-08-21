import { PrismaClient } from '@prisma/client';
const neon = new PrismaClient({
  datasources: { db: { url: 'postgresql://neondb_owner:npg_1bsXTYeRan0O@ep-billowing-mode-ayvdju06-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' } }
});
const cats = await neon.category.findMany({ select: { id: true, name: true, slug: true } });
console.log('Neon Categories:');
for(const c of cats) console.log(`  ${c.id}  |  ${c.name}  |  ${c.slug}`);
await neon.$disconnect();
