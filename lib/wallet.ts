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
