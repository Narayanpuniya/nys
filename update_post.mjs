import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const post = await prisma.post.findFirst({ where: { title: { contains: 'बॉटेनिकल गार्डन — निर्माण' } }, select: { id: true, content: true } });
if (!post) { console.log('Not found!'); await prisma.$disconnect(); process.exit(1); }
const prefix = `## टीम NYS का संघर्ष और श्रमदान

*(14 जून 2023)* टीम NYS के सक्रिय सदस्यों के कठिन परिश्रम और दृढ़ संकल्प की बदौलत यह परियोजना आकार ले सकी। सदस्यों ने स्वयं श्रमदान करते हुए:

- **गुंदियाल नाडी खेल मैदान, कल्पना चावला बॉटेनिकल गार्डन और सीड बैंक** की तारबंदी
- जहरीले **बबूल की खुदाई** कर मैदान को साफ करना
- **नेचर वॉक** और वृक्षारोपण हेतु गड्ढे खोदना
- पौधों के पानी के लिए **नया पानी कनेक्शन** लगवाना

इस श्रमदान से **गुंदियाल नाडी वाइल्डलाइफ केंद्र**, शिक्षा और खेल विकास में अतुलनीय योगदान दिया।

---

`;
await prisma.post.update({ where: { id: post.id }, data: { content: prefix + post.content, date: new Date('2023-06-14') } });
console.log('✅ Shramdaan background merged into Botanical Garden post!');
await prisma.$disconnect();
