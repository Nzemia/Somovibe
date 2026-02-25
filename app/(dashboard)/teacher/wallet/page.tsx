import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import WithdrawButton from "./WithdrawButton";

export default async function WalletPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== "TEACHER") {
        redirect("/");
    }

    // Fetch wallet data
    const wallet = await prisma.wallet.findUnique({
        where: { userId: user.id },
        include: {
            walletTransactions: {
                orderBy: { createdAt: "desc" },
                take: 20,
            },
        },
    });

    // Fetch earnings breakdown
    const materials = await prisma.pdf.findMany({
        where: { teacherId: user.id },
        include: {
            purchases: {
                select: {
                    id: true,
                    createdAt: true,
                },
            },
        },
    });

    type MaterialWithPurchases = typeof materials[number];
    type Transaction = typeof transactions[number];

    const totalEarnings = materials.reduce((sum: number, material: MaterialWithPurchases) => {
        return sum + material.purchases.length * Math.floor(material.price * 0.75);
    }, 0);

    const totalSales = materials.reduce((sum: number, m: MaterialWithPurchases) => sum + m.purchases.length, 0);

    // Use wallet balance, or fall back to calculated earnings if wallet hasn't been credited yet
    const balance = wallet?.balance || totalEarnings;
    const transactions = wallet?.walletTransactions || [];

    // Calculate total credits and debits
    const totalCredits = transactions
        .filter((t: Transaction) => t.type === "CREDIT")
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const totalDebits = transactions
        .filter((t: Transaction) => t.type === "DEBIT")
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">My Wallet</h1>
                        <p className="text-muted-foreground">
                            Manage your earnings and withdrawals
                        </p>
                    </div>
                    <Link
                        href="/teacher"
                        className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 transition-colors inline-flex items-center justify-center space-x-2"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        <span>Back to Dashboard</span>
                    </Link>
                </div>

                {/* Balance Card */}
                <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                    <CardHeader>
                        <CardDescription>Available Balance</CardDescription>
                        <CardTitle className="text-5xl font-bold text-primary">
                            KES {balance.toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <WithdrawButton balance={balance} phone={user.phone} />
                            <Link
                                href="/teacher/upload"
                                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 transition-colors inline-flex items-center justify-center space-x-2"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                <span>Upload Material</span>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Total Earnings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-foreground">
                                KES {totalEarnings.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">All time</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Total Sales</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-foreground">{totalSales}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Across all materials
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Total Credits</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-600">
                                KES {totalCredits.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Money received</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Total Money Made</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-orange-600">
                                KES {totalDebits.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Amount</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Transaction History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>
                            Your recent wallet transactions and earnings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transactions.length === 0 ? (
                            <div className="text-center py-12">
                                <svg
                                    className="w-16 h-16 mx-auto text-muted-foreground mb-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    No transactions yet
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Your transaction history will appear here once you start earning
                                </p>
                                <Link
                                    href="/teacher/upload"
                                    className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
                                >
                                    Upload Your First Material
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((transaction: Transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(
                                                        transaction.createdAt
                                                    ).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        {transaction.type === "CREDIT" ? (
                                                            <>
                                                                <svg
                                                                    className="w-4 h-4 text-green-600"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M12 4v16m8-8H4"
                                                                    />
                                                                </svg>
                                                                <span className="font-medium">
                                                                    Credit
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg
                                                                    className="w-4 h-4 text-orange-600"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M20 12H4"
                                                                    />
                                                                </svg>
                                                                <span className="font-medium">
                                                                    Withdrawal
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell
                                                    className={`font-bold ${transaction.type === "CREDIT"
                                                            ? "text-green-600"
                                                            : "text-orange-600"
                                                        }`}
                                                >
                                                    {transaction.type === "CREDIT" ? "+" : "-"}
                                                    KES {transaction.amount.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="default">Completed</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
