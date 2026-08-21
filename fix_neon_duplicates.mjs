import { PrismaClient } from '@prisma/client';
const neon = new PrismaClient({
  datasources: { db: { url: 'postgresql://neondb_owner:npg_1bsXTYeRan0O@ep-billowing-mode-ayvdju06-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' } }
});

// These OLD unmerged posts need to be deleted from Neon
// (merged versions already exist with new comprehensive titles)
const OLD_TITLES = [
  'हैंडबॉल टीम इंडिया — NYS गूंदियाल',
  'भारतीय महिला हैंडबॉल टीम का ऐतिहासिक सिल्वर मेडल — नवंबर 2025',
  'गुंदियाल की बेटी प्रियंका का स्वागत अभिमंदन — 26 दिसंबर 2025',
  'IHF Youth Women Trophy 2025 — प्रियंका पूनिया की शानदार उपलब्धि',
  'Welcome Back Champion — प्रियंका पूनिया का जोरदार स्वागत',
];

console.log('Looking for old duplicate posts in Neon...\n');
let deleted = 0;
for(const title of OLD_TITLES){
  const p = await neon.post.findFirst({ where: { title }, select: { id: true, title: true } });
  if(p){
    await neon.post.delete({ where: { id: p.id } });
    console.log(`🗑️  Deleted: ${p.title.substring(0,65)}`);
    deleted++;
  } else {
    console.log(`⏭️  Not found (ok): ${title.substring(0,60)}`);
  }
}

const total = await neon.post.count();
console.log(`\n✅ Deleted: ${deleted} old posts | Neon total now: ${total}`);

// Show all posts sorted by date desc
const posts = await neon.post.findMany({ orderBy: { date: 'desc' }, select: { title: true, date: true } });
console.log('\n=== Current Neon posts (newest first) ===');
for(const p of posts){
  console.log(`[${p.date?.toISOString().substring(0,10)}] ${p.title.substring(0,65)}`);
}
await neon.$disconnect();
