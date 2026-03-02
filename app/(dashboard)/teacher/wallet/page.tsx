import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import WithdrawButton from "./WithdrawButton";
import { TeacherFAB } from "@/components/TeacherFAB";

export default async function WalletPage() {
    const user = await getCurrentUser();
    if (!user || user.role !== "TEACHER") redirect("/");

    const wallet = await prisma.wallet.findUnique({
        where: { userId: user.id },
        include: {
            walletTransactions: {
                orderBy: { createdAt: "desc" },
                take: 20,
            },
        },
    });

    const materials = await prisma.pdf.findMany({
        where: { teacherId: user.id },
        select: {
            price: true,
            purchases: { select: { id: true } },
        },
    });

    type MaterialWithPurchases = typeof materials[number];
    type Transaction = typeof transactions[number];

    const totalEarnings = materials.reduce((sum: number, material: MaterialWithPurchases) => {
        return sum + material.purchases.length * Math.floor(material.price * 0.75);
    }, 0);

    const totalSales = materials.reduce((sum: number, m: MaterialWithPurchases) => sum + m.purchases.length, 0);

    // Use wallet balance, or fall back to calculated earnings if wallet hasn't been credited yet
    const balance = wallet?.balance ?? totalEarnings;
    const transactions = wallet?.walletTransactions || [];

    // Calculate total credits and debits
    const totalCredits = transactions
        .filter((t: Transaction) => t.type === "CREDIT")
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const totalDebits = transactions
        .filter((t: Transaction) => t.type === "DEBIT")
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    return (
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 sm:pb-10">

            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-[#008c43] text-xs font-semibold uppercase tracking-widest mb-0.5">Teacher Dashboard</p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">My Wallet</h1>
                </div>
                <Link href="/teacher"
                    className="flex items-center gap-1.5 px-4 py-2.5 border border-[#d1e8dc] text-[#008c43] font-semibold rounded-xl hover:bg-[#f0faf5] transition-colors text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </Link>
            </div>

            {/* Hero banner — balance + stat mini-cards in one green container */}
            <div
                className="rounded-2xl sm:rounded-3xl overflow-hidden mb-6 relative"
                style={{ background: "linear-gradient(135deg, #003318 0%, #006832 45%, #008c43 80%, #00b856 100%)" }}
            >
                {/* Grid texture */}
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

                <div className="relative px-4 sm:px-6 pt-5 pb-5">
                    {/* Balance + actions row */}
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Available Balance</p>
                            </div>
                            <p className="text-4xl sm:text-5xl font-extrabold text-white leading-none">
                                KES {balance.toLocaleString()}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            <WithdrawButton balance={balance} phone={user.phone} />
                            <Link href="/teacher/upload"
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/25 transition-colors text-sm">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                                Upload
                            </Link>
                        </div>
                    </div>

                    {/* 4 stat mini-cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        {heroBannerStats.map(s => (
                            <div key={s.label}
                                className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gradient-to-br ${s.gradient} shadow-lg ${s.shadow}`}>
                                <div className={`${s.light} mb-1.5`}>{s.icon}</div>
                                <p className="text-xl sm:text-2xl font-extrabold text-white leading-none">{s.value}</p>
                                <p className={`${s.light} text-xs font-semibold mt-1`}>{s.label}</p>
                                <p className={`${s.lighter} text-xs mt-0.5`}>{s.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transaction history */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Your recent wallet activity</p>
                    </div>
                    {transactions.length > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">{transactions.length} transactions</span>
                    )}
                </div>

                {transactions.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#f0faf5] text-[#008c43] flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">No transactions yet</h3>
                        <p className="text-gray-500 text-sm mb-5">Your history will appear here once you start earning</p>
                        <Link href="/teacher/upload" className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow"
                            style={{ background: "linear-gradient(135deg, #006832 0%, #008c43 100%)" }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            Upload First Material
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {transactions.map((tx) => {
                            const isCredit = tx.type === "CREDIT";
                            return (
                                <div key={tx.id} className="flex items-center justify-between px-5 sm:px-6 py-4 hover:bg-gray-50/60 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isCredit ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                                            {isCredit ? (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{isCredit ? "Credit" : "Withdrawal"}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(tx.createdAt).toLocaleString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-extrabold ${isCredit ? "text-emerald-600" : "text-amber-600"}`}>
                                            {isCredit ? "+" : "−"}KES {tx.amount.toLocaleString()}
                                        </p>
                                        <span className="text-xs bg-[#f0faf5] text-[#006832] font-semibold px-2 py-0.5 rounded-full">Completed</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <TeacherFAB currentPage="wallet" />
        </div>
    );
}
