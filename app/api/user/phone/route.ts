import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/apiAuth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const user = await requireAuth();
        const { phone } = await req.json();

        await prisma.user.update({
            where: { id: user.id },
            data: { phone },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        return handleAuthError(error);
    }
}
