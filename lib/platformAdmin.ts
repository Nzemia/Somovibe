import { prisma } from "./prisma";

let cachedAdminId: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getPlatformAdminId(): Promise<string | null> {
    const now = Date.now();

    if (cachedAdminId && now - cacheTimestamp < CACHE_TTL_MS) {
        return cachedAdminId;
    }

    const admin = await prisma.user.findUnique({
        where: { email: process.env.PLATFORM_ADMIN_ID! },
        select: { id: true },
    });

    if (admin) {
        cachedAdminId = admin.id;
        cacheTimestamp = now;
    } else {
        cachedAdminId = null;
        cacheTimestamp = 0;
    }

    return cachedAdminId;
}
