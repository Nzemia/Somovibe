import { prisma } from "./prisma";

let cachedAdminId: string | null = null;

export async function getPlatformAdminId(): Promise<string | null> {
    if (cachedAdminId) {
        return cachedAdminId;
    }

    const admin = await prisma.user.findUnique({
        where: { email: process.env.PLATFORM_ADMIN_ID! },
        select: { id: true },
    });

    if (admin) {
        cachedAdminId = admin.id;
    }

    return cachedAdminId;
}
