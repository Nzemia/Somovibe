import { prisma } from "@/lib/prisma";
import { createSupabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" });

    const wallet = await prisma.wallet.findUnique({
        where: { userId: user.id },
    });

    if (!wallet || wallet.balance <= 0)
        return NextResponse.json({ error: "No funds" });

    // Mpesa B2C will go here (next phase)
    await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: 0 },
    });

    return NextResponse.json({ ok: true });
}
