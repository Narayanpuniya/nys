import { PrismaClient } from '@prisma/client';
const neon = new PrismaClient({
  datasources: { db: { url: 'postgresql://neondb_owner:npg_1bsXTYeRan0O@ep-billowing-mode-ayvdju06-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' } }
});
const r = await neon.income.deleteMany({ where: { source: 'MEMBERSHIP' } });
console.log(`✅ ${r.count} income records deleted`);
await neon.$disconnect();
