import { PrismaClient } from '@prisma/client';

const local = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres:nys_local_dev@localhost:5432/nys?schema=public' } }
});
const neon = new PrismaClient({
  datasources: { db: { url: 'postgresql://neondb_owner:npg_1bsXTYeRan0O@ep-billowing-mode-ayvdju06-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' } }
});

// Local → Neon category ID mapping
const CAT_MAP = {
  'cmsunncxm0007lxjc34bu9iyu': 'cmsv8d3an0007lxgo3qnsc5s3', // खेल
  'cmsunncxi0006lxjcht4rk1sy': 'cmsv8d2sh0006lxgo321wqdrv', // शिक्षा
  'cmsunncxq000alxjcpg89dlsk': 'cmsv8d40i000alxgor02lmdod', // सामाजिक सेवा
  'cmsunncxr000blxjcpg94xhvj': 'cmsv8d493000blxgosy0izp8i', // युवा विकास
  'cmsunncxo0008lxjc0toxebwp': 'cmsv8d3jb0008lxgoeodhhoxj', // पर्यावरण
};

const localPosts = await local.post.findMany({
  orderBy: { date: 'asc' },
  select: { title:true, slug:true, excerpt:true, content:true, date:true, categoryId:true, status:true, featured:true, location:true, mainImage:true }
});
console.log(`📦 Local posts: ${localPosts.length}`);

const neonExisting = await neon.post.findMany({ select: { title: true } });
const neonTitles = new Set(neonExisting.map(p => p.title));
console.log(`☁️  Neon existing: ${neonExisting.length}`);

const toAdd = localPosts.filter(p => !neonTitles.has(p.title));
console.log(`➕ To migrate: ${toAdd.length}\n`);

let added = 0, failed = 0;
for(const p of toAdd){
  const neonCatId = CAT_MAP[p.categoryId];
  if(!neonCatId){ console.log(`⚠️  Unknown category for: ${p.title.substring(0,50)}`); failed++; continue; }
  try {
    const slug = p.slug.replace(/-[a-z0-9]{4}$/, '') + '-' + Math.random().toString(36).substring(2,6);
    await neon.post.create({
      data: { title:p.title, slug, excerpt:p.excerpt, content:p.content, date:p.date,
               categoryId:neonCatId, status:'PUBLISHED', featured:p.featured||false,
               location:p.location||null, mainImage:p.mainImage||null }
    });
    console.log(`✅ ${p.title.substring(0,65)}`);
    added++;
  } catch(e){
    console.log(`❌ ${p.title.substring(0,50)} — ${e.message.substring(0,60)}`);
    failed++;
  }
}

const total = await neon.post.count();
console.log(`\n🎉 Done! Added: ${added} | Failed: ${failed} | Neon total: ${total}`);
await local.$disconnect();
await neon.$disconnect();
