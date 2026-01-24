import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const referenceCode = searchParams.get("referenceCode");

    if (!referenceCode) {
        return NextResponse.json({ error: "Reference code required" }, { status: 400 });
    }

    const payment = await prisma.pendingPayment.findUnique({
        where: { referenceCode },
        select: {
            status: true,
            amount: true,
            type: true,
            createdAt: true,
            completedAt: true,
        },
    });

    if (!payment) {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(payment);
}
