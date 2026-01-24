import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireRole, handleAuthError } from "@/lib/apiAuth";

export async function POST(req: Request) {
    try {
        await requireRole("ADMIN");

        const { teacherId } = await req.json();

        if (!teacherId) {
            return NextResponse.json({ error: "Teacher ID required" }, { status: 400 });
        }

        const teacherProfile = await prisma.teacherProfile.findUnique({
            where: { userId: teacherId },
        });

        if (!teacherProfile) {
            return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
        }

        await prisma.teacherProfile.update({
            where: { userId: teacherId },
            data: { isActive: !teacherProfile.isActive },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        return handleAuthError(error);
    }
}
