import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    output: "standalone",
    serverExternalPackages: [
        "@prisma/client",
        "prisma"
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
