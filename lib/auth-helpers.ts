import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
    const session = await auth();

    if (!session?.user?.email) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            teacherProfile: true,
        },
    });

    return user;
}

export async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    return user;
}

export async function requireRole(role: "ADMIN" | "TEACHER" | "STUDENT") {
    const user = await requireAuth();

    if (user.role !== role) {
        throw new Error("Forbidden");
    }

    return user;
}
