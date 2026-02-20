import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getMaterialTypeConfig } from "@/lib/materialTypes";
import ShareButton from "@/components/ShareButton";

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
            downloads: { select: { id: true } },
            materialViews: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    const totalViews    = materials.reduce((s, m) => s + m.materialViews.length, 0);
    const totalSales    = materials.reduce((s, m) => s + m.purchases.length, 0);
    const totalRevenue  = materials.reduce((s, m) => s + m.purchases.length * m.price, 0);
    const totalDownloads = materials.reduce((s, m) => s + m.downloads.length, 0);
    const myEarnings    = Math.floor(totalRevenue * 0.75);

    const summary = [
        { label: "Materials",   value: materials.length, sub: "uploaded",   color: "from-violet-500 to-purple-600",  text: "text-violet-600",  bg: "bg-violet-50",  icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>) },
        { label: "Views",       value: totalViews,       sub: "total views", color: "from-sky-500 to-blue-600",      text: "text-sky-600",     bg: "bg-sky-50",     icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c-2.25 4.5-6 7.5-9 7.5S3 16.5.75 12C3 7.5 6.75 4.5 9.75 4.5S21 7.5 21 12z" /></svg>) },
        { label: "Sales",       value: totalSales,       sub: "purchases",   color: "from-emerald-500 to-teal-600",  text: "text-emerald-600", bg: "bg-emerald-50", icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>) },
        { label: "Downloads",   value: totalDownloads,   sub: "total",       color: "from-amber-500 to-orange-600",  text: "text-amber-600",   bg: "bg-amber-50",   icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>) },
        { label: "My Earnings", value: `KES ${myEarnings.toLocaleString()}`, sub: "75% of sales", color: "from-[#008c43] to-[#006832]", text: "text-[#008c43]", bg: "bg-[#f0faf5]", icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>) },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <p className="text-[#008c43] text-sm font-semibold mb-0.5">Teacher Dashboard</p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Analytics</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Track performance of your learning materials</p>
                </div>
                <Link href="/teacher" className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-[#d1e8dc] text-[#008c43] font-semibold rounded-xl hover:bg-[#f0faf5] transition-colors text-sm w-fit">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </Link>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
                {summary.map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                        <div className={`w-9 h-9 rounded-xl ${s.bg} ${s.text} flex items-center justify-center mb-3`}>
                            {s.icon}
                        </div>
                        <p className={`text-xl font-extrabold ${s.text}`}>{s.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Materials list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Material Performance</h2>
                    {materials.length > 0 && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{materials.length} {materials.length === 1 ? "material" : "materials"}</span>
                    )}
                </div>

                {materials.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#f0faf5] text-[#008c43] flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-gray-800 font-bold mb-1">No materials yet</h3>
                        <p className="text-gray-500 text-sm mb-5">Upload your first material to see analytics here</p>
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
                        {materials.map((material) => {
                            const config = getMaterialTypeConfig(material.materialType);
                            const revenue = material.purchases.length * material.price;
                            const myShare = Math.floor(revenue * 0.75);
                            const conversionRate = material.materialViews.length > 0
                                ? ((material.purchases.length / material.materialViews.length) * 100).toFixed(1)
                                : "0.0";

                            const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
                                APPROVED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
                                PENDING:  { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400"  },
                                REJECTED: { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500"    },
                            };
                            const ss = statusStyles[material.status] ?? statusStyles.PENDING;

                            return (
                                <div key={material.id} className="p-5 sm:p-6 hover:bg-gray-50/60 transition-colors">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-3 mb-2">
                                                <span className="text-2xl shrink-0 mt-0.5">{config.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="text-sm font-bold text-gray-900 leading-snug">{material.title}</h3>
                                                        {material.status === "APPROVED" && (
                                                            <ShareButton url={`/marketplace/${material.id}`} title={material.title} description={material.description} variant="icon" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{material.subject}</span>
                                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{material.grade}</span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${ss.bg} ${ss.text}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                                                            {material.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Uploaded {new Date(material.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stats row */}
                                        <div className="grid grid-cols-5 gap-2 lg:gap-4 lg:min-w-[480px]">
                                            {[
                                                { label: "Views",      value: material.materialViews.length, color: "text-sky-600" },
                                                { label: "Sales",      value: material.purchases.length,     color: "text-emerald-600" },
                                                { label: "Downloads",  value: material.downloads.length,     color: "text-violet-600" },
                                                { label: "Conv.",      value: `${conversionRate}%`,           color: "text-amber-600" },
                                                { label: "Earnings",   value: `KES ${myShare}`,               color: "text-[#008c43]" },
                                            ].map((stat) => (
                                                <div key={stat.label} className="text-center">
                                                    <p className={`text-base sm:text-lg font-extrabold ${stat.color}`}>{stat.value}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recent purchases */}
                                    {material.purchases.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-gray-100">
                                            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                                                Recent buyers ({material.purchases.length})
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {material.purchases.slice(0, 4).map((p) => (
                                                    <span key={p.id} className="text-xs bg-[#f0faf5] text-[#006832] px-2.5 py-1 rounded-full">
                                                        {p.user.email.split("@")[0]}
                                                    </span>
                                                ))}
                                                {material.purchases.length > 4 && (
                                                    <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                                                        +{material.purchases.length - 4} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
