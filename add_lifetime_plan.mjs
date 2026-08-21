import { PrismaClient } from "@prisma/client";

// Neon production DB
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_1bsXTYeRan0O@ep-billowing-mode-ayvdju06-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    },
  },
});

async function main() {
  // Check existing plans
  const existing = await prisma.membershipPlan.findMany({ orderBy: { sortOrder: "asc" } });
  console.log("मौजूदा plans:");
  existing.forEach(p => console.log(`  ${p.slug} — ${p.name} ₹${p.amount} (${p.periodDays} दिन)`));

  // Check if lifetime plan already exists
  const already = existing.find(p => p.slug === "lifetime");
  if (already) {
    console.log("\nलाइफटाइम plan पहले से है:", already);
    return;
  }

  // Add lifetime plan
  const plan = await prisma.membershipPlan.create({
    data: {
      name: "आजीवन सदस्यता",
      slug: "lifetime",
      amount: 15000,
      periodDays: 36500, // 100 years = lifetime
      description: "एक बार, जीवनभर सदस्यता",
      isActive: true,
      sortOrder: 3,
    },
  });

  console.log("\n✅ आजीवन सदस्यता plan जोड़ी गई:");
  console.log(`  ID: ${plan.id}`);
  console.log(`  नाम: ${plan.name}`);
  console.log(`  राशि: ₹${plan.amount}`);
  console.log(`  अवधि: ${plan.periodDays} दिन (जीवनभर)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
