import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";
import { NextResponse } from "next/server";

export async function POST() {
    const user = await requireAuth();

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
