import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Show content of IHF / Priyanka Dec 2025 posts
const titles = [
  'प्रियंका तुम जीत गई',
  'हैंडबॉल टीम इंडिया',
  'भारतीय महिला हैंडबॉल टीम का ऐतिहासिक सिल्वर',
  'अनुराग सिंह ठाकुर',
  'NYS संरक्षक ने प्रियंका पूनिया को IHF चयन',
  'गुंदियाल की बेटी प्रियंका का स्वागत',
  'IHF Youth Women Trophy 2025',
  'Welcome Back Champion',
  '67वीं राज्य स्तरीय हैंडबॉल',
  '67वीं राज्यस्तरीय हैंडबॉल में स्वर्ण',
  '67वीं राज्यस्तरीय हैंडबॉल — 14',
];

for(const t of titles){
  const p = await prisma.post.findFirst({ where: { title: { contains: t } }, select: { id:true, title:true, date:true, content:true }});
  if(p){
    console.log(`\n=== [${p.id}] ${p.title} ===`);
    console.log(`Date: ${p.date?.toISOString().substring(0,10)}`);
    console.log(p.content.substring(0, 800));
    console.log('...[END]...');
  }
}
await prisma.$disconnect();
