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

        // Auto-reconcile wallet from actual purchases before checking balance
        // This ensures the wallet DB record reflects real earnings even if M-Pesa callbacks failed
        const userMaterials = await prisma.pdf.findMany({
            where: { teacherId: user.id },
            include: { purchases: { select: { id: true } } },
        });

        const expectedEarnings = userMaterials.reduce(
            (sum: number, m: { price: number; purchases: { id: string }[] }) =>
                sum + m.purchases.length * Math.floor(m.price * 0.75),
            0
        );

        let wallet = await prisma.wallet.findUnique({
            where: { userId: user.id },
        });

        // If wallet doesn't exist or balance is less than expected, credit the difference
        const currentBalance = wallet?.balance || 0;
        if (expectedEarnings > currentBalance) {
            await creditWallet(user.id, expectedEarnings - currentBalance);
            // Re-fetch the wallet after reconciliation
            wallet = await prisma.wallet.findUnique({
                where: { userId: user.id },
            });
        }

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
            // Refund wallet if B2C initiation fails (uses creditWallet for proper transaction logging)
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
                    error: "Failed to initiate withdrawal. Your balance has been refunded.",
                    details: b2cResult.error,
                },
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
        console.error("Withdrawal error:", error?.message || error, error?.response?.data);
        return handleAuthError(error);
    }
}
