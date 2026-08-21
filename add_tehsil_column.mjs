import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_1bsXTYeRan0O@ep-billowing-mode-ayvdju06-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    },
  },
});

async function main() {
  // Raw SQL: add tehsil column if not exists
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "tehsil" TEXT;
  `);
  console.log("✅ tehsil column added to Member table (or already existed)");

  // Verify
  const result = await prisma.$queryRawUnsafe(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'Member' AND column_name = 'tehsil';
  `);
  console.log("Column check:", result);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
