import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

declare global {
    // eslint-disable-next-line no-var
    var __prisma: PrismaClient | undefined
}

function getClient(): PrismaClient {
    // Always reuse the cached singleton — both in dev and production.
    // Without this, every property access on the lazy proxy creates a new
    // PrismaClient in production, which means interactive transactions
    // ($transaction) open on one client but their internal engine calls
    // land on a completely different client that knows nothing about the
    // open transaction → "Transaction not found" error.
    if (global.__prisma) return global.__prisma

    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
        throw new Error(
            "DATABASE_URL is not set. Make sure it is defined in your environment variables."
        )
    }

    // Prisma v7 requires a driver adapter — datasourceUrl in the constructor
    // is no longer accepted. PrismaPg is already installed as a dependency.
    const adapter = new PrismaPg({ connectionString })
    const client = new PrismaClient({ adapter } as any)

    global.__prisma = client
    return client
}

/**
 * Lazy Prisma proxy — PrismaClient is created only on first property access,
 * not at module-load time, so Next.js build succeeds without a live DB.
 *
 * Methods are explicitly bound to the underlying client so that 'this' inside
 * methods like $transaction always refers to the real client, not this proxy.
 * Without binding, interactive transactions fail in production because Prisma's
 * internal engine calls (this._engine, this._executeRequest, …) re-enter the
 * proxy and can resolve to a different client instance.
 */
export const prisma: PrismaClient = new Proxy(
    {} as PrismaClient,
    {
        get(_target, prop) {
            const client = getClient()
            const value = (client as any)[prop]
            if (typeof value === "function") {
                return value.bind(client)
            }
            return value
        }
    }
)
