import { prisma } from "./prisma";

export async function creditWallet(userId: string, amount: number) {
    const wallet = await prisma.wallet.upsert({
        where: { userId },
        update: { balance: { increment: amount } },
        create: { userId, balance: amount },
    });

    await prisma.walletTransaction.create({
        data: {
            walletId: wallet.id,
            amount,
            type: "CREDIT",
        },
    });
}

export async function debitWallet(userId: string, amount: number) {
    const wallet = await prisma.wallet.findUnique({
        where: { userId },
    });

    if (!wallet || wallet.balance < amount) {
        throw new Error("Insufficient balance");
    }

    await prisma.wallet.update({
        where: { userId },
        data: { balance: { decrement: amount } },
    });

    await prisma.walletTransaction.create({
        data: {
            walletId: wallet.id,
            amount,
            type: "DEBIT",
        },
    });
}

export async function refundWallet(userId: string, amount: number) {
    await creditWallet(userId, amount);
}
