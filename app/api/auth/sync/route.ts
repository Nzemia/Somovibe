import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { email } = await req.json();

    const existing = await prisma.user.findUnique({ where: { email } });

    if (!existing) {
        await prisma.user.create({
            data: { email },
        });
    }

    return NextResponse.json({ ok: true });
}
