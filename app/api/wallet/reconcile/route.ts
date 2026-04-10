import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/apiAuth";
import { NextResponse } from "next/server";
import { creditWallet } from "@/lib/wallet";
import { getPlatformAdminId } from "@/lib/platformAdmin";

export async function POST(req: Request) {
    try {
        const user = await requireAuth();

        // Only admins and teachers can reconcile
        if (user.role !== "ADMIN" && user.role !== "TEACHER") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        const platformAdminId = await getPlatformAdminId();

        // Get all completed purchases with their PDF prices and teacher IDs
        const purchases = await prisma.purchase.findMany({
            include: {
                pdf: {
                    select: { price: true, teacherId: true },
                },
            },
        });

        // Calculate expected balances per user
        const expectedBalances: Record<string, number> = {};

        for (const purchase of purchases) {
            const teacherShare = Math.floor(purchase.pdf.price * 0.75);
            const platformShare = purchase.pdf.price - teacherShare;

            // Teacher earnings
            expectedBalances[purchase.pdf.teacherId] =
                (expectedBalances[purchase.pdf.teacherId] || 0) + teacherShare;

            // Platform admin earnings
            if (platformAdminId) {
                expectedBalances[platformAdminId] =
                    (expectedBalances[platformAdminId] || 0) + platformShare;
            }
        }

        // Also add teacher verification fees to platform admin
        if (platformAdminId) {
            const completedVerifications = await prisma.pendingPayment.count({
                where: {
                    type: "TEACHER_VERIFICATION",
                    status: "COMPLETED",
                },
            });
            expectedBalances[platformAdminId] =
                (expectedBalances[platformAdminId] || 0) +
                completedVerifications * 100;
        }

        // Get all existing wallets
        const wallets = await prisma.wallet.findMany();
        const walletMap: Record<string, { id: string; balance: number }> = {};
        for (const w of wallets) {
            walletMap[w.userId] = { id: w.id, balance: w.balance };
        }

        // Get total debits (withdrawals) per user from wallet transactions
        const allWalletTransactions = await prisma.walletTransaction.findMany({
            where: { type: "DEBIT" },
            include: {
                wallet: {
                    select: { userId: true },
                },
            },
        });

        const totalDebits: Record<string, number> = {};
        for (const tx of allWalletTransactions) {
            totalDebits[tx.wallet.userId] =
                (totalDebits[tx.wallet.userId] || 0) + tx.amount;
        }

        // Reconcile: for each user with expected earnings, ensure wallet reflects correct balance
        let reconciled = 0;
        const details: Array<{
            userId: string;
            previousBalance: number;
            expectedBalance: number;
            credited: number;
        }> = [];

        for (const [userId, expectedTotal] of Object.entries(
            expectedBalances
        )) {
            // If the user is a teacher and not the current user or admin, skip for teacher role
            if (user.role === "TEACHER" && userId !== user.id) {
                continue;
            }

            const currentWallet = walletMap[userId];
            const debits = totalDebits[userId] || 0;

            // Expected current balance = total earnings - total withdrawals
            const expectedCurrentBalance = expectedTotal - debits;
            const actualBalance = currentWallet?.balance || 0;

            if (expectedCurrentBalance > actualBalance) {
                const amountToCredit = expectedCurrentBalance - actualBalance;
                await creditWallet(userId, amountToCredit);
                reconciled++;
                details.push({
                    userId,
                    previousBalance: actualBalance,
                    expectedBalance: expectedCurrentBalance,
                    credited: amountToCredit,
                });
            }
        }

        return NextResponse.json({
            message: `Reconciliation complete. ${reconciled} wallet(s) updated.`,
            reconciled,
            details,
        });
    } catch (error: any) {
        console.error("Reconciliation error:", error);
        return handleAuthError(error);
    }
}
