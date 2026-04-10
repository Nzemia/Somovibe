import "dotenv/config"
import { defineConfig } from "prisma/config"

function normalizeSslMode(
    connectionString: string
): string {
    try {
        const url = new URL(connectionString)
        const sslMode = url.searchParams
            .get("sslmode")
            ?.toLowerCase()

        if (
            sslMode &&
            ["prefer", "require", "verify-ca"].includes(
                sslMode
            )
        ) {
            // Keep the current strict verification behavior on newer pg semantics.
            url.searchParams.set("sslmode", "verify-full")
        }

        return url.toString()
    } catch {
        return connectionString
    }
}

const rawDatasourceUrl =
    process.env["DIRECT_URL"] ??
    process.env["DATABASE_URL"] ??
    ""

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "tsx prisma/seed.ts"
    },
    datasource: {
        url: rawDatasourceUrl
            ? normalizeSslMode(rawDatasourceUrl)
            : "" // Use direct connection for migrations
    }
})
