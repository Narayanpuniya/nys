import { PrismaClient } from '@prisma/client';
const neon = new PrismaClient({
  datasources: { db: { url: 'postgresql://neondb_owner:npg_1bsXTYeRan0O@ep-billowing-mode-ayvdju06-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require' } }
});

// ── 1. पर्यावरण posts: impactNumber = पेड़/पौधे लगाए/संरक्षित (trees) ─────────────
const paryavaranUpdates = [
  // id, trees, label
  { id: 'cmt1azah1001vlxac78ror357', n: 100,  l: 'पौधे' },  // ऑक्सीजोन कॉरीडोर
  { id: 'cmt1az9y6001rlxaccbohk5jm', n: 75,   l: 'पौधे' },  // जुलाई 2024 वृक्षारोपण प्रथम चरण
  { id: 'cmt1az9ft001plxaclm758z0f', n: 500,  l: 'पौधे' },  // अगस्त 2024 वृक्षारोपण (MP, पद्मश्री, कर्नल)
  { id: 'cmt1az976001nlxacoe4a3zjh', n: 200,  l: 'पौधे' },  // विश्व पर्यावरण दिवस 2024
  { id: 'cmt1az8pg001jlxaczshzim4x', n: 150,  l: 'पौधे' },  // ओरण बचाओ संकल्प
  { id: 'cmt1az7hv0019lxach8lrtn9z', n: 200,  l: 'पौधे' },  // वृक्ष मैन प्रसन्नपुरी जी
  { id: 'cmt1az4hj000llxac13rlr7sw', n: 50,   l: 'पौधे' },  // शहीद गंगाराम दिवस वृक्षारोपण
  { id: 'cmt1az49a000jlxac6yzknkzk', n: 30,   l: 'पौधे' },  // जड़ी बूटी दिवस
  { id: 'cmt1az2as0003lxacfwdty34l', n: 150,  l: 'पौधे' },  // कल्पना चावला बॉटेनिकल गार्डन
];

// ── 2. शिक्षा posts: impactNumber = लाभान्वित विद्यार्थी ───────────────────────
const shikshaUpdates = [
  { id: 'cmt1azc7l0029lxacn34gjdlg', n: 200, l: 'विद्यार्थी' },  // शिक्षक दिवस — गुंदियाल विद्यालय
  { id: 'cmt1azbyi0027lxac0ygt31ae', n: 500, l: 'विद्यार्थी' },  // राजकुमार आर्य फाउंडेशन ₹4.5 करोड़ स्कूल
  { id: 'cmt1az6xc0015lxacb4dcdjtt', n: 42,  l: 'छात्रवृत्ति' }, // नेनजी फाउंडेशन छात्रवृत्ति समारोह
];

// ── 3. खेल posts: impactNumber = खिलाड़ी लाभान्वित ───────────────────────────
const khelUpdates = [
  { id: 'cmt1azdet002hlxacsombn7x3', n: 1,  l: 'खिलाड़ी' },  // Welcome Back Champion — प्रियंका
  { id: 'cmt1azd63002flxac0xibz5s1', n: 1,  l: 'खिलाड़ी' },  // IHF Youth Women Trophy — प्रियंका
  { id: 'cmt1azcg7002blxacuy42hgir', n: 2,  l: 'पदक' },      // 69वीं जिला हैंडबॉल — 2 स्वर्ण
  { id: 'cmt1azb7o0021lxacy2y57l6l', n: 2,  l: 'खिलाड़ी' },  // प्रियंका व मनीषा — अकादमी चयन
  { id: 'cmt1azaq1001xlxacwdn8yhb6', n: 1,  l: 'खिलाड़ी' },  // लेखिका चौधरी एशियन योगासना
  { id: 'cmt1az67d000zlxacf0gdhlbi', n: 4,  l: 'खिलाड़ी' },  // राष्ट्रीय हैंडबॉल ₹10,500 पुरस्कार
  { id: 'cmt1az5hr000tlxac10emwm86', n: 4,  l: 'खिलाड़ी' },  // गुंदियाल के 4 राष्ट्रीय चयनित
  { id: 'cmt1az58z000rlxac36yjrkvj', n: 15, l: 'खिलाड़ी' },  // भंवरलाल आर्य जी सम्मान समारोह
  { id: 'cmt1az502000plxac81l1egpv', n: 3,  l: 'पदक' },      // 67वीं राज्यस्तरीय हैंडबॉल
  { id: 'cmt1az39v000blxacu1by06ke', n: 1,  l: 'खिलाड़ी' },  // प्रियंका — राजस्थान अकादमी
];

// ── 4. नई post नहीं मिल रही — नया check ────────────────────────────────────────
const unknown = await neon.post.findMany({
  where: { id: 'nys_post_001' },
  select: { id: true, title: true, category: true, impactNumber: true }
});
if (unknown.length > 0) {
  console.log('nys_post_001:', unknown[0].title, '| cat:', unknown[0].category?.slug);
}

// ── Update all ──────────────────────────────────────────────────────────────────
let updated = 0;
for (const u of [...paryavaranUpdates, ...shikshaUpdates, ...khelUpdates]) {
  await neon.post.update({ where: { id: u.id }, data: { impactNumber: u.n, impactLabel: u.l } });
  updated++;
}

// Also update nys_post_001 if it's in shiksha-relevant category
if (unknown.length > 0) {
  await neon.post.update({ where: { id: 'nys_post_001' }, data: { impactNumber: 5, impactLabel: 'विद्यार्थी' } });
  updated++;
}

console.log(`\n✅ ${updated} posts updated with impact numbers\n`);

// Summary
const paryTotal = paryavaranUpdates.reduce((s, u) => s + u.n, 0);
const shikshaTotal = shikshaUpdates.reduce((s, u) => s + u.n, 0) + 5;
const khelTotal = khelUpdates.reduce((s, u) => s + u.n, 0);
console.log(`🌳 पर्यावरण (पेड़/पौधे): ${paryTotal}`);
console.log(`🎓 विद्यार्थी (शिक्षा): ${shikshaTotal}`);
console.log(`🏆 खिलाड़ी (खेल): ${khelTotal}`);

await neon.$disconnect();
