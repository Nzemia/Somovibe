import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
    prisma: PrismaClient;
};

const datasourceUrl = process.env.DATABASE_URL;

if (!datasourceUrl) {
    throw new Error("DATABASE_URL is not set");
}

export const prisma =
    globalForPrisma.prisma ||
    // Cast to any to satisfy Prisma's stricter option union in v7 while keeping runtime config minimal.
    new PrismaClient({ datasourceUrl } as any);

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
