import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const team    = await prisma.teamMember.deleteMany({});
const mentors = await prisma.mentor.deleteMany({});
const partners = await prisma.partner.deleteMany({});

console.log("TeamMembers deleted:", team.count);
console.log("Mentors deleted    :", mentors.count);
console.log("Partners deleted   :", partners.count);
await prisma.$disconnect();
