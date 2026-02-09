import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma", "pg", "@prisma/adapter-pg"],
};

export default nextConfig;
