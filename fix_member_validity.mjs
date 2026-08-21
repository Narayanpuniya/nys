// सभी ACTIVE members की validity 2 साल (730 दिन) joiningDate से set करता है
// Run: node fix_member_validity.mjs

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_1bsXTYeRan0O@ep-billowing-mode-ayvdju06-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

async function main() {
  const members = await prisma.member.findMany({
    where: { deletedAt: null },
    select: { id: true, memberCode: true, fullName: true, joiningDate: true, validUntil: true, status: true },
  });

  console.log(`कुल ${members.length} सदस्य मिले`);

  let updated = 0;
  for (const m of members) {
    // validUntil = joiningDate + 730 दिन
    const base = m.joiningDate ?? new Date();
    const newValidUntil = new Date(base.getTime() + 730 * 86400000);

    // अगर पहले से 2+ साल है तो skip करो
    if (m.validUntil && m.validUntil >= newValidUntil) {
      console.log(`⏭  ${m.memberCode} ${m.fullName} — already valid till ${m.validUntil.toLocaleDateString("hi-IN")}`);
      continue;
    }

    await prisma.member.update({
      where: { id: m.id },
      data: { validUntil: newValidUntil },
    });

    console.log(`✅ ${m.memberCode} ${m.fullName} → validity: ${newValidUntil.toLocaleDateString("hi-IN")}`);
    updated++;
  }

  console.log(`\n🎉 ${updated} सदस्यों की validity 2 साल के लिए update हुई।`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
