import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const posts = await prisma.post.findMany({
  orderBy: { createdAt: 'asc' },
  select: { id: true, title: true, status: true, mainImage: true }
});

console.log('\n=== Current Post Status ===');
for (const p of posts) {
  console.log(`${p.id} | ${p.status} | ${p.mainImage ? '✅ image' : '❌ no image'} | ${p.title.substring(0, 50)}`);
}

// Publish all archived/draft posts
const result = await prisma.post.updateMany({
  where: { status: { in: ['ARCHIVED', 'DRAFT'] } },
  data: { status: 'PUBLISHED' }
});

console.log(`\n✅ Fixed: ${result.count} posts → PUBLISHED`);

const after = await prisma.post.findMany({
  orderBy: { createdAt: 'asc' },
  select: { id: true, title: true, status: true }
});

console.log('\n=== After Fix ===');
for (const p of after) {
  console.log(`${p.id} | ${p.status} | ${p.title.substring(0, 50)}`);
}

await prisma.$disconnect();
