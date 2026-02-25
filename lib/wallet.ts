import { prisma } from "./prisma";

export async function creditWallet(userId: string, amount: number) {
    await prisma.$transaction(async (tx) => {
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
    });
}

export async function debitWallet(userId: string, amount: number) {
    await prisma.$transaction(async (tx) => {
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
    });
}

export async function refundWallet(userId: string, amount: number) {
    await creditWallet(userId, amount);
}
