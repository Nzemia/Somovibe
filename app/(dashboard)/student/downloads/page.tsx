import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StudentDownloadsPage() {
    const user = await getCurrentUser();
    if (!user || user.role !== "STUDENT") redirect("/");

    /* Fetch only the fields we actually render */
    const downloads = await prisma.download.findMany({
        where: { userId: user.id },
        select: {
            id: true,
            createdAt: true,
            pdf: {
                select: {
                    id: true,
                    title: true,
                    subject: true,
                    grade: true,
                    price: true,
                    materialType: true,
                    teacher: { select: { email: true } },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    /* Group by material */
    const byMaterial = new Map<string, { pdf: typeof downloads[0]["pdf"]; dates: Date[] }>();
    for (const d of downloads) {
        const entry = byMaterial.get(d.pdf.id);
        if (entry) {
            entry.dates.push(new Date(d.createdAt));
        } else {
            byMaterial.set(d.pdf.id, { pdf: d.pdf, dates: [new Date(d.createdAt)] });
        }
    }
    const materials = Array.from(byMaterial.values());

    const totalDownloads = downloads.length;
    const uniqueCount = materials.length;
    const thisMonth = downloads.filter((d) => {
        const dt = new Date(d.createdAt);
        const now = new Date();
        return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
    }).length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <p className="text-[#008c43] text-sm font-semibold mb-1">Student Dashboard</p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Download History</h1>
                </div>
                <Link href="/student" className="self-start inline-flex items-center gap-2 px-4 py-2.5 border border-[#d1e8dc] text-[#008c43] font-semibold rounded-xl hover:bg-[#f0faf5] transition-colors text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                    {
                        label: "Total Downloads", value: totalDownloads,
                        icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
                    },
                    {
                        label: "Unique Materials", value: uniqueCount,
                        icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
                    },
                    {
                        label: "This Month", value: thisMonth,
                        icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
                    },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl border border-[#d1e8dc] p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#008c43]/10 text-[#008c43] flex items-center justify-center shrink-0">
                            {s.icon}
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs mb-0.5">{s.label}</p>
                            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-[#d1e8dc] overflow-hidden">
                <div className="px-6 py-5 border-b border-[#e8f5ee]">
                    <h2 className="text-lg font-bold text-gray-900">Your Downloads</h2>
                </div>

                {materials.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                        <div className="w-16 h-16 bg-[#f0faf5] rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-[#008c43]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No downloads yet</h3>
                        <p className="text-gray-500 text-sm mb-5">Purchase materials to start downloading them</p>
                        <Link href="/marketplace" className="px-6 py-3 bg-[#008c43] text-white font-bold rounded-xl hover:bg-[#006832] transition-colors text-sm">
                            Browse Marketplace
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-[#f0faf5]">
                        {materials.map(({ pdf, dates }) => (
                            <div key={pdf.id} className="p-5 sm:p-6 hover:bg-[#f8fdfb] transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    {/* Icon */}
                                    <div className="w-12 h-12 rounded-xl bg-[#008c43]/10 text-[#008c43] flex items-center justify-center shrink-0">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate">{pdf.title}</h3>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <span className="text-xs font-semibold bg-[#e6f7ee] text-[#008c43] px-2 py-0.5 rounded-full">{pdf.subject}</span>
                                            <span className="text-xs text-gray-400">{pdf.grade}</span>
                                            <span className="text-xs text-gray-400">·</span>
                                            <span className="text-xs text-gray-400">by {pdf.teacher.email.split("@")[0]}</span>
                                        </div>
                                        {/* Download timestamps (last 3) */}
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                            {dates.slice(0, 3).map((dt, i) => (
                                                <span key={i} className="flex items-center gap-1 text-xs text-gray-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#008c43]/50 inline-block" />
                                                    {i === 0 ? "Last: " : ""}{dt.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                                                </span>
                                            ))}
                                            {dates.length > 3 && <span className="text-xs text-gray-400">+{dates.length - 3} more</span>}
                                        </div>
                                    </div>

                                    {/* Download count + button */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="bg-[#f0faf5] text-[#008c43] text-xs font-bold px-3 py-1.5 rounded-full border border-[#d1e8dc]">
                                            {dates.length}× downloaded
                                        </span>
                                        <Link
                                            href={`/api/pdf/download?pdfId=${pdf.id}`}
                                            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#008c43] text-white font-bold rounded-xl hover:bg-[#006832] active:scale-95 transition-all text-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
