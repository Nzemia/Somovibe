import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
    const wallets = await prisma.wallet.findMany();
    const total = wallets.reduce((sum, w) => sum + w.balance, 0);

    return (
        <div>
            <h1>Admin</h1>
            <p>Total platform money: KES {total}</p>
        </div>
    );
}
