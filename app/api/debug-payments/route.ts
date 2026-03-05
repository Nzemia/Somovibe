import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const teacherPayments = await prisma.pendingPayment.findMany({
        where: { type: 'TEACHER_VERIFICATION' },
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    
    const teacherProfiles = await prisma.teacherProfile.findMany({
        where: { userId: { in: teacherPayments.map(p => p.userId) } }
    });
    
    return NextResponse.json({ teacherPayments, teacherProfiles });
}
