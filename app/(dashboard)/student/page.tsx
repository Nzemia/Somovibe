import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default async function StudentPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== "STUDENT") redirect("/");

    const purchases = await prisma.purchase.findMany({
        where: { userId: user.id },
        include: {
            pdf: {
                include: { teacher: { select: { email: true } } },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    const totalSpent = purchases.reduce((sum, p) => sum + p.pdf.price, 0);
    const uniqueSubjects = new Set(purchases.map((p) => p.pdf.subject)).size;
    const thisMonthCount = purchases.filter((p) => {
        const d = new Date(p.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const quickActions = [
        {
            href: "/marketplace",
            label: "Browse Marketplace",
            sub: "Find quality CBC materials",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
        },
        {
            href: "/student/downloads",
            label: "My Downloads",
            sub: "View all your downloads",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            ),
        },
        {
            href: "/student/profile",
            label: "My Profile",
            sub: "Update your information",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* ── Hero header ── */}
            <div className="rounded-3xl overflow-hidden mb-8 relative" style={{ background: "linear-gradient(135deg, #003318 0%, #006832 45%, #008c43 80%, #00b856 100%)" }}>
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div className="relative px-6 sm:px-8 pt-8 pb-6">
                    <div className="mb-8">
                        <p className="text-white/60 text-sm font-medium mb-1">Welcome back</p>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Student Dashboard</h1>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {[
                            { label: "Materials Bought", value: purchases.length, sub: "Learning resources" },
                            { label: "Total Spent", value: `KES ${totalSpent.toLocaleString()}`, sub: "All time", highlight: true },
                            { label: "Subjects", value: uniqueSubjects, sub: "Different subjects" },
                            { label: "This Month", value: thisMonthCount, sub: "New purchases", highlight: true },
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

            {/* ── Quick Actions + Recent ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Quick actions */}
                <div className="bg-white rounded-2xl border border-[#d1e8dc] p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="flex flex-col gap-3">
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

                {/* Recent activity */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#d1e8dc] p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>

                    {purchases.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-center">
                            <div className="w-14 h-14 bg-[#f0faf5] rounded-full flex items-center justify-center mb-3">
                                <svg className="w-7 h-7 text-[#008c43]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-sm mb-3">No purchases yet</p>
                            <Link href="/marketplace" className="px-5 py-2 bg-[#008c43] text-white font-bold rounded-xl text-sm hover:bg-[#006832] transition-colors">
                                Browse Materials
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {purchases.slice(0, 4).map((p) => (
                                <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl bg-[#f8fdfb] border border-[#e8f5ee]">
                                    <div className="w-9 h-9 rounded-lg bg-[#008c43]/10 text-[#008c43] flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{p.pdf.title}</p>
                                        <p className="text-xs text-gray-400">{p.pdf.subject} · {new Date(p.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-sm font-bold text-[#008c43]">KES {p.pdf.price}</span>
                                        <Link href={`/api/pdf/download?pdfId=${p.pdf.id}`} className="w-8 h-8 rounded-lg bg-[#008c43] text-white flex items-center justify-center hover:bg-[#006832] transition-colors" title="Download">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                            {purchases.length > 4 && (
                                <Link href="/student/downloads" className="block text-center text-sm text-[#008c43] font-semibold hover:text-[#006832] pt-1">
                                    View all {purchases.length} purchases →
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── All Purchases table ── */}
            {purchases.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#d1e8dc] overflow-hidden">
                    <div className="px-6 py-5 border-b border-[#e8f5ee] flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">All Purchases</h2>
                        <Link href="/marketplace" className="flex items-center gap-1.5 text-sm text-[#008c43] font-semibold hover:text-[#006832]">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Buy More
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-[#f8fdfb] border-b border-[#e8f5ee]">
                                    <TableHead className="text-gray-600 font-semibold">Material</TableHead>
                                    <TableHead className="text-gray-600 font-semibold">Teacher</TableHead>
                                    <TableHead className="text-gray-600 font-semibold">Subject</TableHead>
                                    <TableHead className="text-gray-600 font-semibold">Grade</TableHead>
                                    <TableHead className="text-gray-600 font-semibold">Price</TableHead>
                                    <TableHead className="text-gray-600 font-semibold">Date</TableHead>
                                    <TableHead className="text-right text-gray-600 font-semibold">Download</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchases.map((p) => (
                                    <TableRow key={p.id} className="hover:bg-[#f8fdfb] transition-colors border-b border-[#f0faf5]">
                                        <TableCell className="font-medium max-w-xs">
                                            <div className="truncate text-gray-900" title={p.pdf.title}>{p.pdf.title}</div>
                                            <div className="text-xs text-gray-400 truncate">{p.pdf.description}</div>
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm">{p.pdf.teacher.email}</TableCell>
                                        <TableCell>
                                            <Badge className="bg-[#e6f7ee] text-[#008c43] border-[#b7deca] hover:bg-[#e6f7ee]">{p.pdf.subject}</Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-600">{p.pdf.grade}</TableCell>
                                        <TableCell className="font-bold text-[#008c43]">KES {p.pdf.price}</TableCell>
                                        <TableCell className="text-gray-400 text-sm">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/api/pdf/download?pdfId=${p.pdf.id}`} className="inline-flex items-center gap-1.5 text-[#008c43] hover:text-[#006832] font-semibold text-sm">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}
