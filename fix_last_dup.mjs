import { PrismaClient } from '@prisma/client';
const neon = new PrismaClient({
  datasources: { db: { url: 'postgresql://neondb_owner:npg_1bsXTYeRan0O@ep-billowing-mode-ayvdju06-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' } }
});
// Dec 26 post is already merged into Welcome Back Champion (Dec 28) — delete old one
const p = await neon.post.findFirst({
  where: { title: { contains: 'गुंदियाल की बेटी प्रियंका का स्वागत अभिनंदन' } },
  select: { id: true, title: true }
});
if(p){ await neon.post.delete({ where: { id: p.id } }); console.log('🗑️  Deleted:', p.title); }
else { console.log('Not found'); }
const total = await neon.post.count();
console.log(`✅ Neon total: ${total}`);
await neon.$disconnect();
