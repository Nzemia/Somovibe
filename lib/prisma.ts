import { PrismaClient } from "@prisma/client";

declare global {
    // eslint-disable-next-line no-var
    var __prisma: PrismaClient | undefined;
}

function getClient(): PrismaClient {
    if (global.__prisma) return global.__prisma;

    // Prisma v7 reads DATABASE_URL from prisma.config.ts automatically.
    // Do NOT pass datasourceUrl to the constructor — it is no longer supported.
    const client = new PrismaClient();

    if (process.env.NODE_ENV !== "production") {
        global.__prisma = client;
    }

    return client;
}

/**
 * Lazy Prisma proxy — PrismaClient is created only on the first property
 * access, not at module-load time, so Next.js build succeeds without a DB.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
    get(_target, prop) {
        return (getClient() as any)[prop];
    },
});
