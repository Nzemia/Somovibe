import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    output: "standalone",
    serverExternalPackages: [
        "@prisma/client",
        "prisma",
        "@neondatabase/serverless",
        "@prisma/adapter-neon"
    ],
    images: {
        remotePatterns: []
    },
    experimental: {
        serverActions: {
            bodySizeLimit: "20mb"
        }
    }
}

export default nextConfig
