import { prisma } from "./prisma";
import { createSupabaseServer } from "./supabase/server";

export async function getCurrentUser() {
    const supabase = await createSupabaseServer();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    return prisma.user.findUnique({
        where: { email: user.email! },
    });
}
