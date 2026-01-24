import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const payload = await req.json();

    const result =
        payload.Body.stkCallback.CallbackMetadata?.Item || [];

    const amount = result.find((i: any) => i.Name === "Amount")?.Value;
    const phone = result.find((i: any) => i.Name === "PhoneNumber")?.Value;

    if (amount === 100) {
        // Activate latest unpaid teacher (simple MVP logic)
        const teacher = await prisma.teacherProfile.findFirst({
            where: { isActive: false },
            orderBy: { createdAt: "desc" },
        });

        if (teacher) {
            await prisma.teacherProfile.update({
                where: { id: teacher.id },
                data: { isActive: true },
            });
        }
    }

    return NextResponse.json({ ok: true });
}
