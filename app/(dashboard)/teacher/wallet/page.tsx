import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import WithdrawButton from "./WithdrawButton";

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

    const totalEarnings  = materials.reduce((s, m) => s + m.purchases.length * Math.floor(m.price * 0.75), 0);
    const totalSales     = materials.reduce((s, m) => s + m.purchases.length, 0);
    const balance        = wallet?.balance ?? 0;
    const transactions   = wallet?.walletTransactions ?? [];
    const totalCredits   = transactions.filter(t => t.type === "CREDIT").reduce((s, t) => s + t.amount, 0);
    const totalWithdrawn = transactions.filter(t => t.type === "DEBIT").reduce((s, t) => s + t.amount, 0);

    const statCards = [
        { label: "Total Earnings",   value: `KES ${totalEarnings.toLocaleString()}`,  sub: "75% of all sales",       icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), bg: "bg-[#f0faf5]", icon_color: "text-[#008c43]", val_color: "text-[#008c43]" },
        { label: "Total Sales",      value: totalSales.toString(),                    sub: "across all materials",   icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>), bg: "bg-emerald-50", icon_color: "text-emerald-600", val_color: "text-emerald-700" },
        { label: "Total Credits",    value: `KES ${totalCredits.toLocaleString()}`,   sub: "money received",         icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>), bg: "bg-sky-50", icon_color: "text-sky-600", val_color: "text-sky-700" },
        { label: "Total Withdrawn",  value: `KES ${totalWithdrawn.toLocaleString()}`, sub: "paid out via M-Pesa",    icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>), bg: "bg-amber-50", icon_color: "text-amber-600", val_color: "text-amber-700" },
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <p className="text-[#008c43] text-sm font-semibold mb-0.5">Teacher Dashboard</p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">My Wallet</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Manage your earnings and withdrawals</p>
                </div>
                <Link href="/teacher" className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-[#d1e8dc] text-[#008c43] font-semibold rounded-xl hover:bg-[#f0faf5] transition-colors text-sm w-fit">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </Link>
            </div>

            {/* Balance card */}
            <div className="rounded-2xl p-6 sm:p-8 mb-6 text-white relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #002a14 0%, #005c2a 50%, #008c43 100%)" }}>
                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -bottom-12 -left-6 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span className="text-white/70 text-sm font-medium">Available Balance</span>
                    </div>
                    <p className="text-4xl sm:text-5xl font-extrabold mb-6">
                        KES {balance.toLocaleString()}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <WithdrawButton balance={balance} phone={user.phone} />
                        <Link href="/teacher/upload"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-white/15 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/25 transition-colors text-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            Upload Material
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {statCards.map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <div className={`w-9 h-9 rounded-xl ${s.bg} ${s.icon_color} flex items-center justify-center mb-3`}>
                            {s.icon}
                        </div>
                        <p className={`text-lg font-extrabold ${s.val_color}`}>{s.value}</p>
                        <p className="text-xs font-semibold text-gray-600 mt-0.5">{s.label}</p>
                        <p className="text-xs text-gray-400">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Transaction history */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
        </div>
    );
}
