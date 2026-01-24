import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function WalletPage() {
    const user = await getCurrentUser();
    const wallet = await prisma.wallet.findUnique({
        where: { userId: user!.id },
    });

    return (
        <div>
            <h1>Wallet</h1>
            <p>Balance: KES {wallet?.balance || 0}</p>
            <form action="/api/wallet/withdraw" method="POST">
                <button>Withdraw</button>
            </form>
        </div>
    );
}
