import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const donations = await prisma.donation.deleteMany({});
const donors    = await prisma.donor.deleteMany({});

console.log("Donations deleted:", donations.count);
console.log("Donors deleted   :", donors.count);
await prisma.$disconnect();
