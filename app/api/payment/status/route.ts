import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth, handleAuthError } from "@/lib/apiAuth";

export async function GET(req: Request) {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(req.url);
        const referenceCode = searchParams.get("referenceCode");

        if (!referenceCode) {
            return NextResponse.json({ error: "Reference code required" }, { status: 400 });
        }

        const payment = await prisma.pendingPayment.findUnique({
            where: { referenceCode },
            select: {
                userId: true,
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

        // Verify the authenticated user owns this payment
        if (payment.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Don't expose userId in the response
        const { userId, ...paymentData } = payment;

        return NextResponse.json(paymentData);
    } catch (error: any) {
        return handleAuthError(error);
    }
}
