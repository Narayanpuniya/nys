import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Show all posts
const posts = await prisma.post.findMany({
  orderBy: { createdAt: 'asc' },
  select: { id: true, title: true, createdAt: true, status: true }
});

console.log(`Total posts: ${posts.length}\n`);

// Find duplicates by title
const seen = new Map();
const toDelete = [];

for (const p of posts) {
  if (seen.has(p.title)) {
    // Keep the first, delete the duplicate
    toDelete.push(p.id);
    console.log(`DUPLICATE: ${p.id} | ${p.title.substring(0, 60)}`);
  } else {
    seen.set(p.title, p.id);
  }
}

if (toDelete.length > 0) {
  const result = await prisma.post.deleteMany({ where: { id: { in: toDelete } } });
  console.log(`\n✅ Deleted ${result.count} duplicates`);
} else {
  console.log('No duplicates found');
}

const final = await prisma.post.count();
console.log(`Final total: ${final} posts`);

await prisma.$disconnect();
