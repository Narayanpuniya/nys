import { PrismaClient } from '@prisma/client';
const neon = new PrismaClient({
  datasources: { db: { url: 'postgresql://neondb_owner:npg_1bsXTYeRan0O@ep-billowing-mode-ayvdju06-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' } }
});

const result = await neon.galleryItem.deleteMany({
  where: {
    id: { in: ['cmt09ojkv00004pkwl9p94sdq', 'cmt09ojyx00014pkwvxd16tyj'] }
  }
});

console.log(`✅ ${result.count} GalleryItem records deleted (Aug 19 "General" broken photos)`);
await neon.$disconnect();
