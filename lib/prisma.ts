import { PrismaClient } from "@prisma/client";

declare global {
    // eslint-disable-next-line no-var
    var __prisma: PrismaClient | undefined;
}

function getClient(): PrismaClient {
    if (global.__prisma) return global.__prisma;

    const datasourceUrl = process.env.DATABASE_URL;
    if (!datasourceUrl) {
        throw new Error(
            "DATABASE_URL is not set. Make sure it is defined in your environment variables."
        );
    }

    const client = new PrismaClient({ datasourceUrl } as any);

    if (process.env.NODE_ENV !== "production") {
        global.__prisma = client;
    }

    return client;
}

/**
 * Lazy Prisma proxy — the real PrismaClient is created only on the first
 * property access, NOT at module-load time.  This lets Next.js import the
 * module during `next build` without requiring DATABASE_URL to be present
 * in the build environment.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
    get(_target, prop) {
        return (getClient() as any)[prop];
    },
});
