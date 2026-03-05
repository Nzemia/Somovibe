import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
    // eslint-disable-next-line no-var
    var __prisma: PrismaClient | undefined;
}

function getClient(): PrismaClient {
    if (global.__prisma) return global.__prisma;

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error(
            "DATABASE_URL is not set. Make sure it is defined in your environment variables."
        );
    }

    // Prisma v7 requires a driver adapter — datasourceUrl in the constructor
    // is no longer accepted. PrismaPg is already installed as a dependency.
    const adapter = new PrismaPg({ connectionString });
    const client = new PrismaClient({ adapter } as any);

    if (process.env.NODE_ENV !== "production") {
        global.__prisma = client;
    }

    return client;
}

/**
 * Lazy Prisma proxy — PrismaClient is created only on first property access,
 * not at module-load time, so Next.js build succeeds without a live DB.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
    get(_target, prop) {
        return (getClient() as any)[prop];
    },
});
