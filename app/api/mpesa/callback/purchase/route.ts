import { prisma } from "@/lib/prisma";
import { creditWallet } from "@/lib/wallet";
import { NextResponse } from "next/server";
import { getPlatformAdminId } from "@/lib/platformAdmin";

export async function POST(req: Request) {
    const payload = await req.json();

    console.log("Purchase callback:", JSON.stringify(payload, null, 2));

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
            const metadata = JSON.parse(payment.metadata || "{}");
            const pdfId = metadata.pdfId;

            if (!pdfId) {
                console.error("No pdfId in payment metadata");
                return NextResponse.json({ ok: false });
            }

            const pdf = await prisma.pdf.findUnique({ where: { id: pdfId } });

            if (!pdf) {
                console.error("PDF not found:", pdfId);
                return NextResponse.json({ ok: false });
            }

            // Calculate shares
            const teacherShare = Math.floor(amount * 0.75);
            const platformShare = amount - teacherShare;

            // Create purchase record
            await prisma.purchase.create({
                data: {
                    userId: payment.userId,
                    pdfId,
                },
            });

            // Credit teacher wallet
            await creditWallet(pdf.teacherId, teacherShare);

            // Credit platform admin wallet
            const platformAdminId = await getPlatformAdminId();
            if (platformAdminId) {
                await creditWallet(platformAdminId, platformShare);
            }

            // Update payment status
            await prisma.pendingPayment.update({
                where: { id: payment.id },
                data: {
                    status: "COMPLETED",
                    completedAt: new Date(),
                },
            });

            console.log("Purchase completed:", {
                userId: payment.userId,
                pdfId,
                teacherShare,
                platformShare,
            });
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
