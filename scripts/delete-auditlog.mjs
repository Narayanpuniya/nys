import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const r = await prisma.auditLog.deleteMany({});
console.log("AuditLog deleted:", r.count);
await prisma.$disconnect();
