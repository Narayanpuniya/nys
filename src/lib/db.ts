import { PrismaClient } from "@prisma/client";

// ── Prisma Singleton — production में भी एक ही connection रहे ────────────────
// यह critical है: नया PrismaClient हर request पर नहीं बनना चाहिए
declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined;
}

export const prisma =
  global._prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn"] : ["error"],
  });

global._prisma = prisma; // production में भी singleton रखें
