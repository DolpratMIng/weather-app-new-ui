import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;
// This file is responsible for initializing the Prisma Client and ensuring that
// it is reused in development to prevent exhausting the database connection pool.
