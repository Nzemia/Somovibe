import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { refundWallet } from "@/lib/wallet";

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        const result = payload.Result;

        if (!result) {
            console.error("No Result in B2C callback");
            return NextResponse.json({ ok: false });
        }

        const conversationId = result.ConversationID;
        const resultCode = result.ResultCode;
        const resultDesc = result.ResultDesc;

        // Find withdrawal request
        const withdrawal = await prisma.withdrawalRequest.findFirst({
            where: { mpesaConversationId: conversationId },
        });

        if (!withdrawal) {
            console.error("Withdrawal not found for conversation:", conversationId);
            return NextResponse.json({ ok: false });
        }

        // Success
        if (resultCode === 0) {
            const resultParameters = result.ResultParameters?.ResultParameter || [];
            const receiptNumber = resultParameters.find(
                (p: any) => p.Key === "TransactionReceipt"
            )?.Value;

            await prisma.withdrawalRequest.update({
                where: { id: withdrawal.id },
                data: {
                    status: "COMPLETED",
                    completedAt: new Date(),
                    mpesaReceiptNumber: receiptNumber,
                    mpesaResponseCode: resultCode.toString(),
                },
            });

        } else {
            // Failed - refund wallet
            await prisma.withdrawalRequest.update({
                where: { id: withdrawal.id },
                data: {
                    status: "FAILED",
                    failureReason: resultDesc,
                    mpesaResponseCode: resultCode.toString(),
                },
            });

            // Refund the amount
            await refundWallet(withdrawal.userId, withdrawal.amount);

        }

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error("B2C callback error:", error);
        return NextResponse.json({ ok: false, error: error.message });
    }
}
