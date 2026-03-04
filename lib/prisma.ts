import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
    const datasourceUrl = process.env.DATABASE_URL;
    if (!datasourceUrl) {
        throw new Error(
            "DATABASE_URL is not set. Make sure it is defined in your environment variables."
        );
    }
    // Cast to any to satisfy Prisma's stricter option union in v7 while keeping runtime config minimal.
    return new PrismaClient({ datasourceUrl } as any);
}

export const prisma: PrismaClient =
    globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
