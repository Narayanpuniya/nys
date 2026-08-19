// Production members delete script
// Run: $env:DATABASE_URL="<prod-url>"; node scripts/delete-members.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL?.slice(0, 40) + "...");

  // Count before
  const count = await prisma.member.count();
  console.log(`\nमिले सदस्य: ${count}`);
  if (count === 0) { console.log("कोई सदस्य नहीं — कुछ नहीं करना।"); return; }

  // Delete related records first (FK order)
  const regs   = await prisma.eventRegistration.deleteMany({ where: { memberId: { not: null } } });
  const vols   = await prisma.volunteer.deleteMany({ where: { memberId: { not: null } } });
  const suggs  = await prisma.suggestion.deleteMany({ where: { memberId: { not: null } } });
  const certs  = await prisma.certificate.deleteMany({});
  const pays   = await prisma.membershipPayment.deleteMany({});
  const members = await prisma.member.deleteMany({});

  console.log(`\n✅ Delete हो गया:`);
  console.log(`  EventRegistrations : ${regs.count}`);
  console.log(`  Volunteers         : ${vols.count}`);
  console.log(`  Suggestions        : ${suggs.count}`);
  console.log(`  Certificates       : ${certs.count}`);
  console.log(`  MembershipPayments : ${pays.count}`);
  console.log(`  Members            : ${members.count}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
