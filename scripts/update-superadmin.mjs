import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

const hash = await bcrypt.hash(process.env._SA_PW, 10);
const updated = await prisma.user.updateMany({
  where: { role: "SUPER_ADMIN" },
  data: {
    name: process.env._SA_NAME,
    email: process.env._SA_EMAIL,
    passwordHash: hash,
  },
});
console.log("✅ Updated:", updated.count, "super admin(s)");
await prisma.$disconnect();
