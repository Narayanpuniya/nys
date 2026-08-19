/**
 * Super Admin reset script
 * ──────────────────────────────────────────────────────────────
 * उपयोग (PowerShell):
 *
 *   $env:DATABASE_URL="<Neon production URL>"
 *   $env:_SA_EMAIL="naraynjat.njnj@gmail.com"
 *   $env:_SA_PW="नया पासवर्ड"
 *   $env:_SA_NAME="Narayan Ram"   ← optional, नाम बदलना हो तो
 *   node scripts/reset-admin.mjs
 *
 * DATABASE_URL → Hostinger → Node.js → Environment Variables → DATABASE_URL
 * ──────────────────────────────────────────────────────────────
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const email    = process.env._SA_EMAIL;
const password = process.env._SA_PW;
const name     = process.env._SA_NAME;

if (!email || !password) {
  console.error("❌ _SA_EMAIL और _SA_PW environment variables सेट करें।");
  process.exit(1);
}

const prisma = new PrismaClient();
const hash = await bcrypt.hash(password, 10);

const data = { email, passwordHash: hash, isActive: true };
if (name) data.name = name;

// email से ढूँढो, नहीं मिला तो SUPER_ADMIN role से
let user = await prisma.user.findUnique({ where: { email } });

if (user) {
  await prisma.user.update({ where: { email }, data });
  console.log(`✅ Updated: ${user.name} (${email})`);
} else {
  // नया SUPER_ADMIN बनाएँ
  const created = await prisma.user.create({
    data: { ...data, name: name ?? "Super Admin", role: "SUPER_ADMIN" }
  });
  console.log(`✅ Created new SUPER_ADMIN: ${created.name} (${created.email})`);
}

await prisma.$disconnect();
console.log("✅ अब नए ईमेल+पासवर्ड से login करें: nys.org.in/login → Admin tab");
