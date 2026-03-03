import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileForm from "./ProfileForm";
import PasswordChangeForm from "@/components/PasswordChangeForm";
import { TeacherFAB } from "@/components/TeacherFAB";

export default async function TeacherProfilePage() {
    const user = await getCurrentUser();
    if (!user || user.role !== "TEACHER") redirect("/");

    const [materials, wallet, teacherProfile] = await Promise.all([
        prisma.pdf.findMany({
            where: { teacherId: user.id },
            select: { id: true, status: true, purchases: { select: { id: true } } },
        }),
        prisma.wallet.findUnique({ where: { userId: user.id }, select: { balance: true } }),
        prisma.teacherProfile.findUnique({ where: { userId: user.id } }),
    ]);

    const totalSales    = materials.reduce((s, m) => s + m.purchases.length, 0);
    const approvedCount = materials.filter(m => m.status === "APPROVED").length;
    const pendingCount  = materials.filter(m => m.status === "PENDING").length;

    // Avatar initials from email
    const initials = user.email.split("@")[0].slice(0, 2).toUpperCase();
    const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const isVerified = teacherProfile?.isActive ?? false;

    return (
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 sm:pb-10">

            {/* ── Page header ── */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-[#008c43] text-xs font-semibold uppercase tracking-widest mb-0.5">Teacher Dashboard</p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">My Profile</h1>
                </div>
                <Link href="/teacher"
                    className="flex items-center gap-1.5 px-4 py-2.5 border border-[#d1e8dc] text-[#008c43] font-semibold rounded-xl hover:bg-[#f0faf5] transition-colors text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </Link>
            </div>

            {/* ── Profile hero banner ── */}
            <div
                className="rounded-2xl sm:rounded-3xl overflow-hidden mb-6 relative"
                style={{ background: "linear-gradient(135deg, #003318 0%, #006832 45%, #008c43 80%, #00b856 100%)" }}
            >
                {/* Grid texture */}
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

                <div className="relative px-5 sm:px-6 py-5 sm:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">

                        {/* Avatar circle */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center shrink-0 shadow-lg">
                            <span className="text-white font-extrabold text-2xl sm:text-3xl tracking-tight">{initials}</span>
                        </div>

                        {/* Identity */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <p className="text-white font-extrabold text-lg sm:text-xl leading-none truncate">{user.email}</p>
                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                    isVerified ? "bg-emerald-400/20 text-emerald-200 border border-emerald-400/40" : "bg-amber-400/20 text-amber-200 border border-amber-400/40"
                                }`}>
                                    {isVerified ? "Verified Teacher" : "Pending Verification"}
                                </span>
                            </div>
                            <p className="text-white/60 text-sm">Member since {memberSince}</p>
                        </div>

                        {/* Inline stats */}
                        <div className="flex gap-3 sm:gap-4 shrink-0 flex-wrap">
                            {[
                                { label: "Materials", value: materials.length  },
                                { label: "Approved",  value: approvedCount     },
                                { label: "Sales",     value: totalSales        },
                            ].map(s => (
                                <div key={s.label} className="text-center bg-white/10 rounded-xl px-3 py-2 min-w-[52px]">
                                    <p className="text-white font-extrabold text-lg leading-none">{s.value}</p>
                                    <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
                                </div>
                            ))}
                            <div className="text-center bg-white/10 rounded-xl px-3 py-2 min-w-[72px]">
                                <p className="text-white font-extrabold text-lg leading-none">KES {(wallet?.balance ?? 0).toLocaleString()}</p>
                                <p className="text-white/60 text-xs mt-0.5">Balance</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Two-column layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── Main column ── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Account Information */}
                    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#f0faf5] text-[#008c43] flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-gray-900 leading-none">Account Information</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Update your contact details</p>
                            </div>
                        </div>
                        <div className="p-5 sm:p-6">
                            <ProfileForm user={user} />
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#f0faf5] text-[#008c43] flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-gray-900 leading-none">Change Password</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Keep your account secure</p>
                            </div>
                        </div>
                        <div className="p-5 sm:p-6">
                            <PasswordChangeForm />
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#f0faf5] text-[#008c43] flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-gray-900 leading-none">Account Details</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Your account status and history</p>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {[
                                {
                                    title: "Account Type",
                                    sub: "Your current role on Somovibe",
                                    badge: { label: "Teacher", cls: "bg-[#f0faf5] text-[#006832] border border-[#d1e8dc]" },
                                },
                                {
                                    title: "Verification Status",
                                    sub: "Teacher account verification",
                                    badge: isVerified
                                        ? { label: "Verified", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" }
                                        : { label: "Pending Review", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
                                },
                                {
                                    title: "Account Status",
                                    sub: "Your account is in good standing",
                                    badge: { label: "Active", cls: "bg-[#f0faf5] text-[#006832] border border-[#d1e8dc]" },
                                },
                            ].map(item => (
                                <div key={item.title} className="flex items-center justify-between px-5 sm:px-6 py-4">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.badge.cls}`}>
                                        {item.badge.label}
                                    </span>
                                </div>
                            ))}
                            <div className="flex items-center justify-between px-5 sm:px-6 py-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Member Since</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Account creation date</p>
                                </div>
                                <p className="text-sm font-bold text-gray-700">
                                    {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Sidebar ── */}
                <div className="space-y-5">

                    {/* Teaching stats */}
                    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-bold text-gray-900">Teaching Stats</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Your performance overview</p>
                        </div>
                        <div className="p-4 space-y-2.5">
                            {[
                                { label: "Total Materials", value: materials.length, bg: "bg-violet-50", tc: "text-violet-600",
                                  icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>) },
                                { label: "Approved",       value: approvedCount,    bg: "bg-emerald-50", tc: "text-emerald-600",
                                  icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>) },
                                { label: "Pending Review", value: pendingCount,     bg: "bg-amber-50",   tc: "text-amber-600",
                                  icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>) },
                                { label: "Total Sales",    value: totalSales,       bg: "bg-sky-50",     tc: "text-sky-600",
                                  icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>) },
                            ].map(s => (
                                <div key={s.label} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-8 h-8 rounded-lg ${s.bg} ${s.tc} flex items-center justify-center shrink-0`}>
                                            {s.icon}
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">{s.label}</p>
                                    </div>
                                    <p className={`text-xl font-extrabold ${s.tc}`}>{s.value}</p>
                                </div>
                            ))}

                            {/* Wallet balance */}
                            <div className="rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg, #003318 0%, #008c43 100%)" }}>
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-white/70 text-xs font-medium">Wallet Balance</p>
                                    <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-2xl font-extrabold">KES {(wallet?.balance ?? 0).toLocaleString()}</p>
                                <Link href="/teacher/wallet" className="mt-2 inline-flex items-center gap-1 text-xs text-white/70 hover:text-white font-semibold transition-colors">
                                    Manage wallet
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Quick links */}
                    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-bold text-gray-900">Quick Links</h2>
                        </div>
                        <div className="p-3 space-y-1.5">
                            {[
                                { href: "/teacher/analytics", label: "View Analytics",    sub: "Track views, sales & earnings",   bg: "bg-indigo-50", tc: "text-indigo-600",
                                  icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>) },
                                { href: "/teacher/upload",    label: "Upload Material",   sub: "Share a new resource",            bg: "bg-[#f0faf5]", tc: "text-[#008c43]",
                                  icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>) },
                                { href: "/teacher/wallet",    label: "My Wallet",         sub: "Earnings & withdrawals",          bg: "bg-sky-50",    tc: "text-sky-600",
                                  icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>) },
                            ].map(item => (
                                <Link key={item.href} href={item.href}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                                    <div className={`w-8 h-8 rounded-lg ${item.bg} ${item.tc} flex items-center justify-center shrink-0`}>
                                        {item.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 leading-none">{item.label}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                                    </div>
                                    <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <TeacherFAB currentPage="profile" />
        </div>
    );
}
