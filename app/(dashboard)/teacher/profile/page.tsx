import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileForm from "./ProfileForm";
import PasswordChangeForm from "@/components/PasswordChangeForm";

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

    const totalSales      = materials.reduce((s, m) => s + m.purchases.length, 0);
    const approvedCount   = materials.filter(m => m.status === "APPROVED").length;
    const pendingCount    = materials.filter(m => m.status === "PENDING").length;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <p className="text-[#008c43] text-sm font-semibold mb-0.5">Teacher Dashboard</p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">My Profile</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Manage your account and public info</p>
                </div>
                <Link href="/teacher" className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-[#d1e8dc] text-[#008c43] font-semibold rounded-xl hover:bg-[#f0faf5] transition-colors text-sm w-fit">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Main column */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Account information card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900">Account Information</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Update your personal details</p>
                        </div>
                        <div className="p-6">
                            <ProfileForm user={user} />
                        </div>
                    </div>

                    {/* Password card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900">Change Password</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Keep your account secure</p>
                        </div>
                        <div className="p-6">
                            <PasswordChangeForm />
                        </div>
                    </div>

                    {/* Account details card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900">Account Details</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Your account information and status</p>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {[
                                {
                                    title: "Account Type",
                                    sub: "Your current role",
                                    badge: { label: "Teacher", cls: "bg-[#f0faf5] text-[#006832]" },
                                },
                                {
                                    title: "Verification Status",
                                    sub: "Teacher verification",
                                    badge: teacherProfile?.isActive
                                        ? { label: "Verified", cls: "bg-emerald-50 text-emerald-700" }
                                        : { label: "Pending", cls: "bg-amber-50 text-amber-700" },
                                },
                                {
                                    title: "Account Status",
                                    sub: "Your account is active",
                                    badge: { label: "Active", cls: "bg-[#f0faf5] text-[#006832]" },
                                },
                            ].map((item) => (
                                <div key={item.title} className="flex items-center justify-between px-6 py-4">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.badge.cls}`}>
                                        {item.badge.label}
                                    </span>
                                </div>
                            ))}
                            <div className="flex items-center justify-between px-6 py-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Member Since</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Account creation date</p>
                                </div>
                                <p className="text-sm font-semibold text-gray-700">
                                    {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-5">

                    {/* Teaching stats */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900">Teaching Stats</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Your performance overview</p>
                        </div>
                        <div className="p-4 space-y-3">
                            {[
                                {
                                    label: "Total Materials",
                                    value: materials.length,
                                    bg: "bg-violet-50", tc: "text-violet-600",
                                    icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>),
                                },
                                {
                                    label: "Approved",
                                    value: approvedCount,
                                    bg: "bg-emerald-50", tc: "text-emerald-600",
                                    icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
                                },
                                {
                                    label: "Pending Review",
                                    value: pendingCount,
                                    bg: "bg-amber-50", tc: "text-amber-600",
                                    icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
                                },
                                {
                                    label: "Total Sales",
                                    value: totalSales,
                                    bg: "bg-sky-50", tc: "text-sky-600",
                                    icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>),
                                },
                            ].map((s) => (
                                <div key={s.label} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg ${s.bg} ${s.tc} flex items-center justify-center shrink-0`}>
                                            {s.icon}
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">{s.label}</p>
                                    </div>
                                    <p className={`text-xl font-extrabold ${s.tc}`}>{s.value}</p>
                                </div>
                            ))}

                            {/* Wallet balance highlight */}
                            <div className="mt-1 rounded-xl p-4 text-white" style={{ background: "linear-gradient(135deg, #003318 0%, #008c43 100%)" }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white/70 text-xs mb-0.5">Wallet Balance</p>
                                        <p className="text-2xl font-extrabold">KES {(wallet?.balance ?? 0).toLocaleString()}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                </div>
                                <Link href="/teacher/wallet" className="mt-3 inline-block text-xs text-white/80 hover:text-white font-semibold underline underline-offset-2">
                                    Manage wallet →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Analytics CTA */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-[#f0faf5] text-[#008c43] flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm mb-1">Track Your Performance</h3>
                        <p className="text-xs text-gray-500 mb-4">See detailed analytics of your materials</p>
                        <Link href="/teacher/analytics"
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-white text-sm font-bold rounded-xl w-full justify-center"
                            style={{ background: "linear-gradient(135deg, #006832 0%, #008c43 100%)" }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            View Analytics
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
