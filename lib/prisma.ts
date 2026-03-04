import { PrismaClient } from "@/app/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaNeon({ connectionString })

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
