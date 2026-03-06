import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

// Original function for standalone use
export async function creditWallet(userId: string, amount: number) {
    await prisma.$transaction(
        async (tx) => {
            await creditWalletTx(tx, userId, amount);
        },
        {
            maxWait: 10000, // 10s
            timeout: 20000, // 20s
        }
    );
}

// Transaction-aware helper function
export async function creditWalletTx(tx: Prisma.TransactionClient, userId: string, amount: number) {
    const wallet = await tx.wallet.upsert({
        where: { userId },
        update: { balance: { increment: amount } },
        create: { userId, balance: amount },
    });

    await tx.walletTransaction.create({
        data: {
            walletId: wallet.id,
            amount,
            type: "CREDIT",
        },
    });
}

export async function debitWallet(userId: string, amount: number) {
    await prisma.$transaction(
        async (tx) => {
            const wallet = await tx.wallet.findUnique({
                where: { userId },
            });

            if (!wallet || wallet.balance < amount) {
                throw new Error("Insufficient balance");
            }

            await tx.wallet.update({
                where: { userId },
                data: { balance: { decrement: amount } },
            });

            await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    amount,
                    type: "DEBIT",
                },
            });
        },
        {
            maxWait: 10000, // 10s
            timeout: 20000, // 20s
        }
    );
}

export async function refundWallet(userId: string, amount: number) {
    await creditWallet(userId, amount);
}

