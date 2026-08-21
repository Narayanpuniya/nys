// Settings में संस्था का नाम और पता update करो
import { PrismaClient } from "@prisma/client";

const NEON_URL = "postgresql://neondb_owner:npg_1bsXTYeRan0O@ep-billowing-mode-ayvdju06-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function updateSettings(label, prisma) {
  const row = await prisma.setting.findUnique({ where: { key: "org" } });
  if (!row) {
    console.log(`[${label}] 'org' setting row नहीं मिली — skip`);
    return;
  }

  const current = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
  const updated = {
    ...current,
    name: "श्री नारायणपुरी यूथ सोसायटी (NYS)",
    address: "गुन्दियाल नगर, जाटी भाण्डू, जोधपुर (राज.)",
  };

  await prisma.setting.update({
    where: { key: "org" },
    data: { value: JSON.stringify(updated) },
  });

  console.log(`[${label}] ✅ update हो गया`);
  console.log(`  name: ${updated.name}`);
  console.log(`  address: ${updated.address}`);
}

async function run() {
  // LOCAL
  const local = new PrismaClient();
  try { await updateSettings("LOCAL", local); } catch(e) { console.error("[LOCAL]", e.message); } finally { await local.$disconnect(); }

  // NEON
  const neon = new PrismaClient({ datasources: { db: { url: NEON_URL } } });
  try { await updateSettings("NEON", neon); } catch(e) { console.error("[NEON]", e.message); } finally { await neon.$disconnect(); }
}

run();
