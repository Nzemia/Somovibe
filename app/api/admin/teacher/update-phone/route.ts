import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole, handleAuthError } from "@/lib/apiAuth";

export async function POST(req: Request) {
    try {
        await requireRole("ADMIN");

        const { teacherId, phone } = await req.json();

        if (!teacherId || !phone) {
            return NextResponse.json(
                { error: "Teacher ID and phone required" },
                { status: 400 }
            );
        }

        await prisma.user.update({
            where: { id: teacherId },
            data: { phone },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        return handleAuthError(error);
    }
}
