import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const income  = await prisma.income.deleteMany({});
const expense = await prisma.expense.deleteMany({});

console.log("Income deleted :", income.count);
console.log("Expense deleted:", expense.count);
await prisma.$disconnect();
