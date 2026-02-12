import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { refundWallet } from "@/lib/wallet";

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        console.log("B2C Timeout Callback:", JSON.stringify(payload, null, 2));

        const result = payload.Result;

        if (!result) {
            return NextResponse.json({ ok: false });
        }

        const conversationId = result.ConversationID;

        // Find withdrawal request
        const withdrawal = await prisma.withdrawalRequest.findFirst({
            where: { mpesaConversationId: conversationId },
        });

        if (!withdrawal) {
            console.error("Withdrawal not found for timeout:", conversationId);
            return NextResponse.json({ ok: false });
        }

        // Mark as failed and refund
        await prisma.withdrawalRequest.update({
            where: { id: withdrawal.id },
            data: {
                status: "FAILED",
                failureReason: "Request timeout",
            },
        });

        // Refund the amount
        await refundWallet(withdrawal.userId, withdrawal.amount);

        console.log("⏱️ Withdrawal timeout, refunded:", withdrawal.id);

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error("B2C timeout callback error:", error);
        return NextResponse.json({ ok: false, error: error.message });
    }
}
