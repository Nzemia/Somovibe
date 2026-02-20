import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SuccessToast from "./SuccessToast";
import ShareButton from "@/components/ShareButton";
import { TeacherQuotes } from "@/components/TeacherQuotes";
import { TeacherFAB } from "@/components/TeacherFAB";
import { TeacherMaterials, type MaterialRow } from "@/components/TeacherMaterials";

export default async function TeacherPage({
    searchParams,
}: {
    searchParams: Promise<{ verified?: string; upload?: string }>;
}) {
    const user = await getCurrentUser();
    const params = await searchParams;

    if (!user || user.role !== "TEACHER") redirect("/");

    const [materials, wallet] = await Promise.all([
        prisma.pdf.findMany({
            where: { teacherId: user.id },
            include: { purchases: { select: { id: true } } },
            orderBy: { createdAt: "desc" },
        }),
        prisma.wallet.findUnique({
            where: { userId: user.id },
            select: { balance: true },
        }),
    ]);

    const stats = {
        totalUploads: materials.length,
        pending: materials.filter((m) => m.status === "PENDING").length,
        approved: materials.filter((m) => m.status === "APPROVED").length,
        totalSales: materials.reduce((sum, m) => sum + m.purchases.length, 0),
        walletBalance: wallet?.balance ?? 0,
    };

    /* Serialise for client component */
    const materialRows: MaterialRow[] = materials.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description ?? "",
        subject: m.subject,
        grade: m.grade,
        price: m.price,
        status: m.status,
        createdAt: m.createdAt.toISOString(),
        salesCount: m.purchases.length,
    }));

    const quickActions = [
        {
            href: "/teacher/upload",
            label: "Upload Material",
            sub: "Share your resources",
            color: "bg-[#008c43]/10 text-[#008c43] hover:bg-[#008c43]/20",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
            ),
        },
        {
            href: "/teacher/analytics",
            label: "Analytics",
            sub: "Track views, sales & earnings",
            color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
        },
        {
            href: "/teacher/wallet",
            label: "Wallet",
            sub: "Check earnings & withdraw",
            color: "bg-sky-50 text-sky-600 hover:bg-sky-100",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ),
        },
        {
            href: "/teacher/profile",
            label: "Profile",
            sub: "Manage your profile",
            color: "bg-amber-50 text-amber-600 hover:bg-amber-100",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 sm:pb-8">
            <SuccessToast verified={params.verified} uploaded={params.upload} />

            {/* ── Hero header ── */}
            <div
                className="rounded-2xl sm:rounded-3xl overflow-hidden mb-6"
                style={{ background: "linear-gradient(135deg, #003318 0%, #006832 45%, #008c43 80%, #00b856 100%)" }}
            >
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

                <div className="relative px-4 sm:px-6 pt-5 pb-4">
                    {/* Top row: quote + actions */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                        {/* Rotating quote */}
                        <div className="flex-1 max-w-xl">
                            <TeacherQuotes />
                        </div>

                        {/* Action buttons */}
                        <div className="hidden sm:flex items-center gap-2 shrink-0">
                            <ShareButton
                                url={`/teacher/${user.id}`}
                                title="My Teaching Profile"
                                description="Check out my teaching materials"
                                variant="button"
                                label="Share your profile"
                            />
                            <Link
                                href="/teacher/upload"
                                className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#008c43] font-bold rounded-xl hover:bg-white/95 active:scale-95 transition-all text-sm shadow-lg"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                                Upload
                            </Link>
                        </div>
                    </div>

                    {/* Stat cards — 4 distinct colors */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        {/* Total Uploads — violet */}
                        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-900/30">
                            <p className="text-violet-200 text-xs mb-1">Total Uploads</p>
                            <p className="text-2xl font-extrabold text-white">{stats.totalUploads}</p>
                            <p className="text-violet-300 text-xs mt-0.5">{stats.pending} pending</p>
                        </div>

                        {/* Approved — emerald */}
                        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-teal-900/30">
                            <p className="text-emerald-200 text-xs mb-1">Approved</p>
                            <p className="text-2xl font-extrabold text-white">{stats.approved}</p>
                            <p className="text-emerald-300 text-xs mt-0.5">Live on marketplace</p>
                        </div>

                        {/* Total Sales — amber */}
                        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-900/30">
                            <p className="text-amber-100 text-xs mb-1">Total Sales</p>
                            <p className="text-2xl font-extrabold text-white">{stats.totalSales}</p>
                            <p className="text-amber-200 text-xs mt-0.5">Across all materials</p>
                        </div>

                        {/* Wallet — sky blue */}
                        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-blue-900/30">
                            <p className="text-sky-200 text-xs mb-1">Wallet Balance</p>
                            <p className="text-2xl font-extrabold text-white">KES {stats.walletBalance.toLocaleString()}</p>
                            <p className="text-sky-300 text-xs mt-0.5">Available to withdraw</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Quick Actions + Earnings (desktop only) ── */}
            <div className="hidden sm:grid sm:grid-cols-3 gap-6 mb-8">
                <div className="sm:col-span-2 bg-white rounded-2xl border border-[#d1e8dc] p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((a) => (
                            <Link
                                key={a.href}
                                href={a.href}
                                className="group flex items-center gap-4 p-4 rounded-xl border border-[#e8f5ee] hover:border-[#008c43]/30 hover:bg-[#f0faf5] transition-all duration-200"
                            >
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${a.color}`}>
                                    {a.icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm truncate">{a.label}</p>
                                    <p className="text-gray-500 text-xs">{a.sub}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Earnings breakdown */}
                <div className="bg-white rounded-2xl border border-[#d1e8dc] p-6 flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Earnings Split</h2>
                    <div className="flex-1 flex flex-col justify-center gap-4">
                        <div className="flex gap-2 items-end">
                            <div className="flex-1 bg-[#008c43] rounded-xl h-24 flex flex-col items-center justify-center text-white">
                                <span className="text-3xl font-extrabold">75%</span>
                                <span className="text-white/70 text-xs mt-0.5">You keep</span>
                            </div>
                            <div className="w-1/3 bg-gray-100 rounded-xl h-14 flex flex-col items-center justify-center text-gray-600">
                                <span className="text-xl font-bold">25%</span>
                                <span className="text-gray-400 text-[10px] mt-0.5">Platform</span>
                            </div>
                        </div>
                        <ul className="text-xs text-gray-500 space-y-1.5">
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#008c43] inline-block" />KES 75 per KES 100 sale</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#008c43] inline-block" />Instantly credited to wallet</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#008c43] inline-block" />Withdraw anytime via M-Pesa</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* ── My Materials ── */}
            <div>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-lg font-bold text-gray-900">My Materials</h2>
                    <Link
                        href="/teacher/upload"
                        className="hidden sm:flex items-center gap-1.5 text-sm text-[#008c43] font-semibold hover:text-[#006832]"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        Upload New
                    </Link>
                </div>

                <TeacherMaterials materials={materialRows} />
            </div>

            {/* Mobile FAB */}
            <TeacherFAB />
        </div>
    );
}
