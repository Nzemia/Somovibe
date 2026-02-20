import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";

// SVG icon map matching the upload form — no emojis
const TYPE_ICONS: Record<string, React.ReactNode> = {
    PDF: (
        <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
            <rect x="8" y="4" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M22 4v7h6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M13 17h10M13 21h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M13 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    PDF_SLIDES: (
        <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
            <rect x="5" y="8" width="26" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M16 26l-2 5M20 26v5M24 26l2 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M14 31h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M13 14l4 4 3-3 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    POWERPOINT: (
        <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
            <rect x="5" y="6" width="26" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M18 26v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M14 32h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="18" cy="15" r="5" stroke="currentColor" strokeWidth="2" />
            <path d="M18 15l5-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M18 10v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    CLASS_INSTRUCTIONS: (
        <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
            <rect x="10" y="6" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
            <rect x="14" y="3" width="12" height="6" rx="1.5" stroke="currentColor" strokeWidth="2" />
            <path d="M15 17l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 23l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    SCHEME_OF_WORK: (
        <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
            <rect x="6" y="8" width="28" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M14 4v8M26 4v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M6 18h28" stroke="currentColor" strokeWidth="2" />
            <path d="M6 24h28M6 30h28" stroke="currentColor" strokeWidth="1.5" />
            <path d="M18 18v16M26 18v16" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    LESSON_PLAN: (
        <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
            <rect x="7" y="5" width="22" height="28" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M7 5h4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M12 13h11M12 18h11M12 23h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M27 24l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="25" cy="22" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
    ),
    EXAM_QUIZ: (
        <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
            <rect x="8" y="5" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M13 13h10M13 18h10M13 23h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M26 25l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M26 25l2 5-2-1-2 1 2-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
    ),
};

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    APPROVED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Approved" },
    PENDING:  { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",  label: "Pending"  },
    REJECTED: { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500",    label: "Rejected" },
};

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

    const totalViews     = materials.reduce((s, m) => s + m.materialViews.length, 0);
    const totalSales     = materials.reduce((s, m) => s + m.purchases.length, 0);
    const totalRevenue   = materials.reduce((s, m) => s + m.purchases.length * m.price, 0);
    const totalDownloads = materials.reduce((s, m) => s + m.downloads.length, 0);
    const myEarnings     = Math.floor(totalRevenue * 0.75);

    const summary = [
        {
            label: "Materials", value: materials.length, sub: "uploaded",
            text: "text-violet-600", bg: "bg-violet-50",
            icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>),
        },
        {
            label: "Views", value: totalViews, sub: "total views",
            text: "text-sky-600", bg: "bg-sky-50",
            icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>),
        },
        {
            label: "Sales", value: totalSales, sub: "purchases",
            text: "text-emerald-600", bg: "bg-emerald-50",
            icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>),
        },
        {
            label: "Downloads", value: totalDownloads, sub: "total",
            text: "text-amber-600", bg: "bg-amber-50",
            icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>),
        },
        {
            label: "My Earnings", value: `KES ${myEarnings.toLocaleString()}`, sub: "75% of sales",
            text: "text-[#008c43]", bg: "bg-[#f0faf5]",
            icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
        },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-10">

            {/* Header — matches upload page exactly */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <p className="text-[#008c43] text-xs font-semibold uppercase tracking-widest mb-0.5">Teacher Dashboard</p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Analytics</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Track the performance of every material you upload</p>
                </div>
                <Link href="/teacher"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-[#d1e8dc] text-[#008c43] font-semibold rounded-xl hover:bg-[#f0faf5] transition-colors text-sm w-fit">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </Link>
            </div>

            {/* Summary stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
                {summary.map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-4 flex flex-col gap-3">
                        <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.text} flex items-center justify-center shrink-0`}>
                            {s.icon}
                        </div>
                        <div>
                            <p className={`text-xl font-extrabold leading-none ${s.text}`}>{s.value}</p>
                            <p className="text-xs font-semibold text-gray-700 mt-1">{s.label}</p>
                            <p className="text-xs text-gray-400">{s.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Materials list */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Material Performance</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Views, sales, downloads and earnings per material</p>
                    </div>
                    {materials.length > 0 && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full shrink-0">
                            {materials.length} {materials.length === 1 ? "material" : "materials"}
                        </span>
                    )}
                </div>

                {materials.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#f0faf5] text-[#008c43] flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-gray-800 font-bold text-base mb-1">No materials yet</h3>
                        <p className="text-gray-500 text-sm mb-5">Upload your first material to start seeing analytics here</p>
                        <Link href="/teacher/upload"
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow"
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
                            const revenue        = material.purchases.length * material.price;
                            const myShare        = Math.floor(revenue * 0.75);
                            const conversionRate = material.materialViews.length > 0
                                ? ((material.purchases.length / material.materialViews.length) * 100).toFixed(1)
                                : "0.0";
                            const ss = STATUS_STYLES[material.status] ?? STATUS_STYLES.PENDING;
                            const typeIcon = TYPE_ICONS[material.materialType];

                            const perMatStats = [
                                { label: "Views",     value: material.materialViews.length,           bg: "bg-sky-50",     text: "text-sky-700"     },
                                { label: "Sales",     value: material.purchases.length,               bg: "bg-emerald-50", text: "text-emerald-700" },
                                { label: "Downloads", value: material.downloads.length,               bg: "bg-violet-50",  text: "text-violet-700"  },
                                { label: "Conv.",     value: `${conversionRate}%`,                    bg: "bg-amber-50",   text: "text-amber-700"   },
                                { label: "Earnings",  value: `KES ${myShare.toLocaleString()}`,        bg: "bg-[#f0faf5]",  text: "text-[#008c43]"   },
                            ];

                            return (
                                <div key={material.id} className="p-5 sm:p-6 hover:bg-gray-50/40 transition-colors">

                                    {/* Material identity row */}
                                    <div className="flex items-start gap-3 mb-4">
                                        {/* Type icon */}
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                                            {typeIcon ?? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="text-sm font-bold text-gray-900 leading-snug">{material.title}</h3>
                                                {material.status === "APPROVED" && (
                                                    <ShareButton
                                                        url={`/marketplace/${material.id}`}
                                                        title={material.title}
                                                        description={material.description}
                                                        variant="icon"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{material.subject}</span>
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{material.grade}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${ss.bg} ${ss.text}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ss.dot}`} />
                                                    {ss.label}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(material.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Per-material stat chips */}
                                    <div className="grid grid-cols-5 gap-2">
                                        {perMatStats.map((stat) => (
                                            <div key={stat.label}
                                                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl ${stat.bg}`}>
                                                <p className={`text-sm sm:text-base font-extrabold leading-none ${stat.text}`}>
                                                    {stat.value}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Recent buyers */}
                                    {material.purchases.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                                                Recent buyers
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {material.purchases.slice(0, 5).map((p) => (
                                                    <span key={p.id} className="text-xs bg-[#f0faf5] text-[#006832] font-medium px-2.5 py-1 rounded-full">
                                                        {p.user.email.split("@")[0]}
                                                    </span>
                                                ))}
                                                {material.purchases.length > 5 && (
                                                    <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                                                        +{material.purchases.length - 5} more
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
