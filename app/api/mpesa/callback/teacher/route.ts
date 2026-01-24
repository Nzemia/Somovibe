import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const payload = await req.json();

    console.log("Teacher payment callback:", JSON.stringify(payload, null, 2));

    const stkCallback = payload.Body?.stkCallback;

    if (!stkCallback) {
        return NextResponse.json({ ok: false });
    }

    const resultCode = stkCallback.ResultCode;
    const referenceCode = stkCallback.AccountReference;

    // Find pending payment
    const payment = await prisma.pendingPayment.findUnique({
        where: { referenceCode },
    });

    if (!payment) {
        console.error("Payment not found for reference:", referenceCode);
        return NextResponse.json({ ok: false });
    }

    // Payment successful
    if (resultCode === 0) {
        const meta = stkCallback.CallbackMetadata?.Item || [];
        const amount = meta.find((i: any) => i.Name === "Amount")?.Value;

        if (amount === payment.amount) {
            // Update payment status
            await prisma.pendingPayment.update({
                where: { id: payment.id },
                data: {
                    status: "COMPLETED",
                    completedAt: new Date(),
                },
            });

            // Activate teacher profile
            await prisma.teacherProfile.update({
                where: { userId: payment.userId },
                data: { isActive: true },
            });

            console.log("Teacher activated:", payment.userId);
        }
    } else {
        // Payment failed
        await prisma.pendingPayment.update({
            where: { id: payment.id },
            data: { status: "FAILED" },
        });

        console.log("Payment failed for:", referenceCode);
    }

    return NextResponse.json({ ok: true });
}
