import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/apiAuth";
import { NextResponse } from "next/server";
import { debitWallet, creditWallet } from "@/lib/wallet";
import { initiateB2CPayment } from "@/lib/mpesa";

const MIN_WITHDRAWAL = 10; // Minimum KES 10
const MAX_WITHDRAWAL = 150000; // Maximum KES 150,000

export async function POST(req: Request) {
    try {
        const user = await requireAuth();
        const { amount, phone } = await req.json();

        // Validate amount
        if (!amount || amount < MIN_WITHDRAWAL) {
            return NextResponse.json(
                { error: `Minimum withdrawal is KES ${MIN_WITHDRAWAL}` },
                { status: 400 }
            );
        }

        if (amount > MAX_WITHDRAWAL) {
            return NextResponse.json(
                { error: `Maximum withdrawal is KES ${MAX_WITHDRAWAL}` },
                { status: 400 }
            );
        }

        // Validate phone
        if (!phone || !/^254\d{9}$/.test(phone)) {
            return NextResponse.json(
                { error: "Invalid phone number. Format: 254XXXXXXXXX" },
                { status: 400 }
            );
        }

        const wallet = await prisma.wallet.findUnique({
            where: { userId: user.id },
        });

        if (!wallet || wallet.balance < amount) {
            return NextResponse.json(
                { error: "Insufficient balance" },
                { status: 400 }
            );
        }

        // Check for pending withdrawals
        const pendingWithdrawal = await prisma.withdrawalRequest.findFirst({
            where: {
                userId: user.id,
                status: { in: ["PENDING", "PROCESSING"] },
            },
        });

        if (pendingWithdrawal) {
            return NextResponse.json(
                { error: "You have a pending withdrawal. Please wait for it to complete." },
                { status: 400 }
            );
        }

        // Debit wallet first
        try {
            await debitWallet(user.id, amount);
        } catch (debitError: any) {
            console.error("Debit wallet error:", debitError?.message);
            return NextResponse.json(
                { error: `Failed to debit wallet: ${debitError?.message || "Unknown error"}` },
                { status: 500 }
            );
        }

        // Create withdrawal request
        const withdrawal = await prisma.withdrawalRequest.create({
            data: {
                userId: user.id,
                amount,
                phone,
                status: "PROCESSING",
            },
        });

        // Initiate M-Pesa B2C payment
        try {
            const b2cResult = await initiateB2CPayment(
                phone,
                amount,
                `Withdrawal - ${user.email}`
            );

            if (!b2cResult.success) {
                // Refund wallet if B2C initiation fails
                await creditWallet(user.id, amount);

                await prisma.withdrawalRequest.update({
                    where: { id: withdrawal.id },
                    data: {
                        status: "FAILED",
                        failureReason: JSON.stringify(b2cResult.error),
                    },
                });

                console.error("B2C withdrawal failed:", JSON.stringify(b2cResult.error, null, 2));

                return NextResponse.json(
                    {
                        error: "Failed to initiate M-Pesa withdrawal. Your balance has been refunded.",
                        details: b2cResult.error,
                    },
                    { status: 500 }
                );
            }

            // Update withdrawal with M-Pesa conversation ID
            // Safaricom may use ConversationID or OriginatorConversationID
            const conversationId =
                b2cResult.data.ConversationID ||
                b2cResult.data.OriginatorConversationID ||
                null;

            await prisma.withdrawalRequest.update({
                where: { id: withdrawal.id },
                data: {
                    mpesaConversationId: conversationId,
                },
            });

            // Re-fetch updated withdrawal to return accurate data
            const updatedWithdrawal = await prisma.withdrawalRequest.findUnique({
                where: { id: withdrawal.id },
            });

            return NextResponse.json({
                message: "Withdrawal initiated. You will receive the money shortly.",
                withdrawal: updatedWithdrawal,
            });
        } catch (b2cError: any) {
            // If B2C throws an exception (e.g. token fetch fails), refund the wallet
            console.error("B2C exception:", b2cError?.message, b2cError?.response?.data);

            await creditWallet(user.id, amount);

            await prisma.withdrawalRequest.update({
                where: { id: withdrawal.id },
                data: {
                    status: "FAILED",
                    failureReason: b2cError?.message || "B2C exception",
                },
            });

            return NextResponse.json(
                {
                    error: `M-Pesa B2C payment failed: ${b2cError?.message || "Unknown error"}`,
                    details: b2cError?.response?.data || null,
                },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error("Withdrawal error:", error?.message || error);

        if (error instanceof Error) {
            if (error.message === "UNAUTHORIZED") {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            if (error.message === "FORBIDDEN") {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            if (error.message === "USER_NOT_FOUND") {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }
        }

        return NextResponse.json(
            { error: `Withdrawal failed: ${error?.message || "Unknown error"}` },
            { status: 500 }
        );
    }
}
