import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import SuccessToast from "./SuccessToast";
import ShareButton from "@/components/ShareButton";

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

    const quickActions = [
        {
            href: "/teacher/upload",
            label: "Upload Material",
            sub: "Share your teaching resources",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            ),
        },
        {
            href: "/teacher/analytics",
            label: "Analytics",
            sub: "Track views, sales & earnings",
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
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ),
        },
        {
            href: "/teacher/profile",
            label: "Profile",
            sub: "Manage your teacher profile",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SuccessToast verified={params.verified} uploaded={params.upload} />

            {/* ── Hero header ── */}
            <div className="rounded-3xl overflow-hidden mb-8 relative" style={{ background: "linear-gradient(135deg, #003318 0%, #006832 45%, #008c43 80%, #00b856 100%)" }}>
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div className="relative px-6 sm:px-8 pt-8 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <p className="text-white/60 text-sm font-medium mb-1">Welcome back</p>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Teacher Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <ShareButton url={`/teacher/${user.id}`} title="My Teaching Profile" description="Check out my teaching materials" variant="button" />
                            <Link href="/teacher/upload" className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#008c43] font-bold rounded-xl hover:bg-white/95 active:scale-95 transition-all text-sm shadow-lg">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                                Upload
                            </Link>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {[
                            { label: "Total Uploads", value: stats.totalUploads, sub: `${stats.pending} pending` },
                            { label: "Approved", value: stats.approved, sub: "Live on marketplace", highlight: true },
                            { label: "Total Sales", value: stats.totalSales, sub: "Across all materials" },
                            { label: "Wallet Balance", value: `KES ${stats.walletBalance.toLocaleString()}`, sub: "Available to withdraw", highlight: true },
                        ].map((s) => (
                            <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4">
                                <p className="text-white/60 text-xs mb-1">{s.label}</p>
                                <p className={`text-2xl font-extrabold ${s.highlight ? "text-[#7fffb2]" : "text-white"}`}>{s.value}</p>
                                <p className="text-white/45 text-xs mt-0.5">{s.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Quick Actions + Earnings ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Quick actions */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#d1e8dc] p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {quickActions.map((a) => (
                            <Link key={a.href} href={a.href} className="group flex items-center gap-4 p-4 rounded-xl border border-[#e8f5ee] hover:border-[#008c43]/40 hover:bg-[#f0faf5] transition-all duration-200">
                                <div className="w-11 h-11 rounded-xl bg-[#008c43]/10 text-[#008c43] flex items-center justify-center shrink-0 group-hover:bg-[#008c43]/20 transition-colors">
                                    {a.icon}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{a.label}</p>
                                    <p className="text-gray-500 text-xs">{a.sub}</p>
                                </div>
                                <svg className="w-4 h-4 text-[#008c43] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Earnings breakdown */}
                <div className="bg-white rounded-2xl border border-[#d1e8dc] p-6 flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Your Earnings Split</h2>
                    <div className="flex-1 flex flex-col justify-center gap-4">
                        <div className="flex gap-2 items-end">
                            <div className="flex-1 bg-[#008c43] rounded-xl h-28 flex flex-col items-center justify-center text-white">
                                <span className="text-3xl font-extrabold">75%</span>
                                <span className="text-white/70 text-xs mt-1">You keep</span>
                            </div>
                            <div className="w-1/3 bg-gray-100 rounded-xl h-16 flex flex-col items-center justify-center text-gray-600">
                                <span className="text-xl font-bold">25%</span>
                                <span className="text-gray-400 text-xs mt-0.5">Platform</span>
                            </div>
                        </div>
                        <ul className="text-sm text-gray-500 space-y-1.5">
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#008c43] inline-block" />KES 75 earned per KES 100 sale</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#008c43] inline-block" />Instantly credited to wallet</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#008c43] inline-block" />Withdraw anytime via M-Pesa</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* ── My Materials ── */}
            <div className="bg-white rounded-2xl border border-[#d1e8dc] overflow-hidden">
                <div className="px-6 py-5 border-b border-[#e8f5ee] flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">My Materials</h2>
                    {materials.length > 0 && (
                        <Link href="/teacher/upload" className="flex items-center gap-1.5 text-sm text-[#008c43] font-semibold hover:text-[#006832]">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New
                        </Link>
                    )}
                </div>

                {materials.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <div className="w-16 h-16 bg-[#f0faf5] rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-[#008c43]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No materials yet</h3>
                        <p className="text-gray-500 text-sm mb-5">Upload your first CBC resource and start earning</p>
                        <Link href="/teacher/upload" className="inline-flex items-center gap-2 px-6 py-3 bg-[#008c43] text-white font-bold rounded-xl hover:bg-[#006832] transition-colors text-sm">
                            Upload Your First Material
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-[#f8fdfb] border-b border-[#e8f5ee]">
                                    <TableHead className="text-gray-600 font-semibold">Title</TableHead>
                                    <TableHead className="text-gray-600 font-semibold">Subject</TableHead>
                                    <TableHead className="text-gray-600 font-semibold">Grade</TableHead>
                                    <TableHead className="text-gray-600 font-semibold">Price</TableHead>
                                    <TableHead className="text-gray-600 font-semibold">Status</TableHead>
                                    <TableHead className="text-gray-600 font-semibold">Sales</TableHead>
                                    <TableHead className="text-gray-600 font-semibold">Uploaded</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {materials.map((m) => (
                                    <TableRow key={m.id} className="hover:bg-[#f8fdfb] transition-colors border-b border-[#f0faf5]">
                                        <TableCell className="font-medium max-w-xs">
                                            <div className="truncate text-gray-900" title={m.title}>{m.title}</div>
                                            <div className="text-xs text-gray-400 truncate">{m.description}</div>
                                        </TableCell>
                                        <TableCell className="text-gray-600 text-sm">{m.subject}</TableCell>
                                        <TableCell className="text-gray-600 text-sm">{m.grade}</TableCell>
                                        <TableCell className="font-bold text-[#008c43]">KES {m.price}</TableCell>
                                        <TableCell>
                                            {m.status === "APPROVED" && <Badge className="bg-[#e6f7ee] text-[#008c43] border-[#b7deca] hover:bg-[#e6f7ee]">Approved</Badge>}
                                            {m.status === "PENDING" && <Badge variant="secondary">Pending</Badge>}
                                            {m.status === "REJECTED" && <Badge variant="destructive">Rejected</Badge>}
                                        </TableCell>
                                        <TableCell className="font-semibold text-gray-900">{m.purchases.length}</TableCell>
                                        <TableCell className="text-gray-400 text-sm">{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            {m.status === "APPROVED" && (
                                                <ShareButton url={`/marketplace/${m.id}`} title={m.title} description={m.description} variant="icon" />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}
