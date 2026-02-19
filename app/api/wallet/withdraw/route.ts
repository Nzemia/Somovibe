import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/apiAuth";
import { NextResponse } from "next/server";
import { debitWallet } from "@/lib/wallet";
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

        // Check wallet balance
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

        // DEV MODE: Auto-complete withdrawal
        if (process.env.DEV_MODE === "true") {
            await debitWallet(user.id, amount);

            const withdrawal = await prisma.withdrawalRequest.create({
                data: {
                    userId: user.id,
                    amount,
                    phone,
                    status: "COMPLETED",
                    completedAt: new Date(),
                    mpesaReceiptNumber: `DEV${Date.now()}`,
                },
            });

            return NextResponse.json({
                message: "DEV MODE: Withdrawal completed instantly",
                devMode: true,
                withdrawal,
            });
        }

        // PRODUCTION: Debit wallet first
        await debitWallet(user.id, amount);

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
        const b2cResult = await initiateB2CPayment(
            phone,
            amount,
            `Withdrawal - ${user.email}`
        );

        if (!b2cResult.success) {
            // Refund wallet if B2C fails
            await prisma.wallet.update({
                where: { userId: user.id },
                data: { balance: { increment: amount } },
            });

            await prisma.withdrawalRequest.update({
                where: { id: withdrawal.id },
                data: {
                    status: "FAILED",
                    failureReason: JSON.stringify(b2cResult.error),
                },
            });

            return NextResponse.json(
                { error: "Failed to initiate withdrawal. Your balance has been refunded." },
                { status: 500 }
            );
        }

        // Update withdrawal with M-Pesa conversation ID
        await prisma.withdrawalRequest.update({
            where: { id: withdrawal.id },
            data: {
                mpesaConversationId: b2cResult.data.ConversationID,
            },
        });

        return NextResponse.json({
            message: "Withdrawal initiated. You will receive the money shortly.",
            withdrawal,
        });
    } catch (error: any) {
        console.error("Withdrawal error:", error);
        return handleAuthError(error);
    }
}
