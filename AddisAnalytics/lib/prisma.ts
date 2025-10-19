import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

const SCHEMA_ERROR_CODES = new Set(["P1012", "P2010", "P2021", "P2022"]);

export function isSchemaOutOfSyncError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (SCHEMA_ERROR_CODES.has(error.code) || /does not exist/i.test(error.message))
  );
}
