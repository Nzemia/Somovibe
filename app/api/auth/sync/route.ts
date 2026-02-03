import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { email, role } = await req.json();

    const existing = await prisma.user.findUnique({ where: { email } });

    if (!existing) {
        await prisma.user.create({
            data: {
                email,
                role: role || "STUDENT" // Default to STUDENT if no role provided
            },
        });
    }

    return NextResponse.json({ ok: true });
}
