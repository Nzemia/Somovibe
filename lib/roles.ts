import { getCurrentUser } from "@/lib/auth";

export async function requireAdmin() {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        throw new Error("UNAUTHORIZED");
    }
    return user;
}

export async function requireTeacher() {
    const user = await getCurrentUser();
    if (!user || user.role !== "TEACHER") {
        throw new Error("UNAUTHORIZED");
    }
    return user;
}

export async function requireStudent() {
    const user = await getCurrentUser();
    if (!user || user.role !== "STUDENT") {
        throw new Error("UNAUTHORIZED");
    }
    return user;
}
