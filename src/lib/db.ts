// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

// This approach prevents multiple instances of PrismaClient in development,
// which can cause issues like hot-reloading errors.
const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  // Use globalThis for broader compatibility and explicitly type it for clarity
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
