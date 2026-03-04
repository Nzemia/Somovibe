import { PrismaClient } from "@/app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

// Use DIRECT_URL (not pooler) to avoid PgBouncer prepared statement issues
const pool = new Pool({
    connectionString:
        process.env.DIRECT_URL || process.env.DATABASE_URL
})
const adapter = new PrismaPg(pool)

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log:
            process.env.NODE_ENV === "development"
                ? ["error", "warn"]
                : ["error"]
    })

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma
}
