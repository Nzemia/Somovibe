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
        const { amount, phone: rawPhone } = await req.json();

        // Validate amount
        if (!amount || amount < MIN_WITHDRAWAL) {
            return NextResponse.json(
                { error: `Minimum withdrawal amount is KES ${MIN_WITHDRAWAL}` },
                { status: 400 }
            );
        }

        if (amount > MAX_WITHDRAWAL) {
            return NextResponse.json(
                { error: `Maximum withdrawal amount is KES ${MAX_WITHDRAWAL.toLocaleString()}` },
                { status: 400 }
            );
        }

        // Normalize phone: convert 07xx → 254xx, +254xx → 254xx
        let phone = typeof rawPhone === "string" ? rawPhone.replace(/\s+/g, "") : "";
        if (phone.startsWith("+")) phone = phone.slice(1);
        if (phone.startsWith("0")) phone = "254" + phone.slice(1);

        // Validate phone
        if (!phone || !/^254\d{9}$/.test(phone)) {
            return NextResponse.json(
                { error: "Please enter a valid phone number (e.g., 0712345678 or 254712345678)" },
                { status: 400 }
            );
        }

        const wallet = await prisma.wallet.findUnique({
            where: { userId: user.id },
        });

        if (!wallet || wallet.balance < amount) {
            return NextResponse.json(
                { error: "You don't have enough funds in your wallet" },
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
                { error: "You have a pending withdrawal. Please wait for it to complete before requesting another" },
                { status: 400 }
            );
        }

        // Debit wallet first
        try {
            await debitWallet(user.id, amount);
        } catch (debitError: any) {
            console.error("Debit wallet error:", debitError?.message);
            return NextResponse.json(
                { error: "Unable to process withdrawal. Please try again" },
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
                        error: "Withdrawal request failed. Your balance has been refunded. Please try again",
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
                message: "Withdrawal request sent! You will receive the money shortly",
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
                    error: "Withdrawal failed. Your balance has been refunded. Please try again later",
                },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error("Withdrawal error:", error?.message || error);

        if (error instanceof Error) {
            if (error.message === "UNAUTHORIZED") {
                return NextResponse.json({ error: "Please log in to continue" }, { status: 401 });
            }
            if (error.message === "FORBIDDEN") {
                return NextResponse.json({ error: "You don't have permission to do that" }, { status: 403 });
            }
            if (error.message === "USER_NOT_FOUND") {
                return NextResponse.json({ error: "Account not found" }, { status: 404 });
            }
        }

        return NextResponse.json(
            { error: "Withdrawal failed. Please try again" },
            { status: 500 }
        );
    }
}