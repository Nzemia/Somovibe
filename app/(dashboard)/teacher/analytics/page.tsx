import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AnalyticsMaterials, type AnalyticsRow } from "@/components/AnalyticsMaterials";

export default async function TeacherAnalyticsPage() {
    const user = await getCurrentUser();
    if (!user || user.role !== "TEACHER") redirect("/");

    const materials = await prisma.pdf.findMany({
        where: { teacherId: user.id },
        include: {
            purchases: {
                select: { id: true, createdAt: true, user: { select: { email: true } } },
                orderBy: { createdAt: "desc" },
            },
            downloads:     { select: { id: true } },
            materialViews: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    // Aggregate totals
    const totalViews     = materials.reduce((s, m) => s + m.materialViews.length, 0);
    const totalSales     = materials.reduce((s, m) => s + m.purchases.length, 0);
    const totalRevenue   = materials.reduce((s, m) => s + m.purchases.length * m.price, 0);
    const totalDownloads = materials.reduce((s, m) => s + m.downloads.length, 0);
    const myEarnings     = Math.floor(totalRevenue * 0.75);

    // Serialise for client component
    const rows: AnalyticsRow[] = materials.map(m => ({
        id:          m.id,
        title:       m.title,
        description: m.description ?? "",
        subject:     m.subject,
        grade:       m.grade,
        price:       m.price,
        status:      m.status,
        materialType: m.materialType,
        createdAt:   m.createdAt.toISOString(),
        views:       m.materialViews.length,
        salesCount:  m.purchases.length,
        downloads:   m.downloads.length,
        earnings:    Math.floor(m.purchases.length * m.price * 0.75),
        buyerEmails: m.purchases.map(p => p.user.email),
    }));

    const summaryCards = [
        {
            label: "Total Materials", value: materials.length, sub: "uploaded",
            gradient: "from-violet-500 to-purple-600", shadow: "shadow-purple-900/30",
            light: "text-violet-200", lighter: "text-violet-300",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
        {
            label: "Total Views", value: totalViews, sub: "all time",
            gradient: "from-sky-500 to-blue-600", shadow: "shadow-blue-900/30",
            light: "text-sky-200", lighter: "text-sky-300",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            ),
        },
        {
            label: "Total Sales", value: totalSales, sub: "purchases made",
            gradient: "from-emerald-500 to-teal-600", shadow: "shadow-teal-900/30",
            light: "text-emerald-200", lighter: "text-emerald-300",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
        },
        {
            label: "Downloads", value: totalDownloads, sub: "total downloads",
            gradient: "from-amber-400 to-orange-500", shadow: "shadow-orange-900/30",
            light: "text-amber-100", lighter: "text-amber-200",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            ),
        },
        {
            label: "My Earnings", value: `KES ${myEarnings.toLocaleString()}`, sub: "75% of all sales",
            gradient: "from-[#008c43] to-[#004d25]", shadow: "shadow-green-900/30",
            light: "text-green-200", lighter: "text-green-300",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 sm:pb-10">

            {/* ── Page header — matches upload page ── */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-[#008c43] text-xs font-semibold uppercase tracking-widest mb-0.5">Teacher Dashboard</p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Analytics</h1>
                </div>
                <Link href="/teacher"
                    className="flex items-center gap-1.5 px-4 py-2.5 border border-[#d1e8dc] text-[#008c43] font-semibold rounded-xl hover:bg-[#f0faf5] transition-colors text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </Link>
            </div>

            {/* ── Summary hero banner — same structure as teacher dashboard hero ── */}
            <div
                className="rounded-2xl sm:rounded-3xl overflow-hidden mb-6 relative"
                style={{ background: "linear-gradient(135deg, #003318 0%, #006832 45%, #008c43 80%, #00b856 100%)" }}
            >
                {/* Grid texture */}
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

                <div className="relative px-4 sm:px-6 pt-5 pb-5">
                    {/* Banner title */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Performance Summary</p>
                            <p className="text-white font-bold text-lg">Your numbers at a glance</p>
                        </div>
                        <Link href="/teacher/upload"
                            className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#008c43] font-bold rounded-xl hover:bg-white/95 active:scale-95 transition-all text-sm shadow-lg shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            Upload
                        </Link>
                    </div>

                    {/* 5 stat mini-cards inside the banner */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                        {summaryCards.map(s => (
                            <div key={s.label}
                                className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gradient-to-br ${s.gradient} shadow-lg ${s.shadow}`}>
                                <div className={`${s.light} mb-1.5`}>{s.icon}</div>
                                <p className="text-2xl font-extrabold text-white leading-none">{s.value}</p>
                                <p className={`${s.light} text-xs font-semibold mt-1`}>{s.label}</p>
                                <p className={`${s.lighter} text-xs mt-0.5`}>{s.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Material Performance — same section card as upload page ── */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Material Performance</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Views, sales, downloads and earnings per material</p>
                    </div>
                    {rows.length > 0 && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full shrink-0">
                            {rows.length} {rows.length === 1 ? "material" : "materials"}
                        </span>
                    )}
                </div>
                <div className="p-4 sm:p-5">
                    <AnalyticsMaterials materials={rows} />
                </div>
            </div>
        </div>
    );
}
