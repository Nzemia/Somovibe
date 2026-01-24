import { prisma } from "@/lib/prisma";
import { createSupabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { phone } = await req.json();
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" });

    await prisma.user.update({
        where: { email: user.email! },
        data: { phone },
    });

    return NextResponse.json({ ok: true });
}
