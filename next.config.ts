import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    experimental: {
        // Allow multipart uploads above the default proxy request limit.
        // This supports material (10MB) + optional cover image (5MB) in one request.
        proxyClientMaxBodySize: "20mb",
        serverActions: {
            bodySizeLimit: "20mb"
        }
    }
}

export default nextConfig
