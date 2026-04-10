import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { phone } = await req.json();
    const user = await requireAuth();

    await prisma.user.update({
        where: { id: user.id },
        data: { phone },
    });

    return NextResponse.json({ ok: true });
}
