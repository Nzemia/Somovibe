import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { email } = await req.json();

    const user = await prisma.user.update({
        where: { email },
        data: { role: "TEACHER" },
    });

    await prisma.teacherProfile.create({
        data: {
            userId: user.id,
            isActive: false,
        },
    });

    return NextResponse.json({ message: "Teacher created. Awaiting payment." });
}
