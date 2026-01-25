import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminNav } from "@/components/AdminNav";

export default async function AdminDashboard() {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
        redirect("/admin/unauthorized");
    }

    // Get stats
    const [
        totalTeachers,
        activeTeachers,
        totalPdfs,
        pendingPdfs,
        totalStudents,
        platformWallet,
        totalPurchases,
        totalSalesRevenue,
        teacherVerifications
    ] = await Promise.all([
        prisma.teacherProfile.count(),
        prisma.teacherProfile.count({ where: { isActive: true } }),
        prisma.pdf.count(),
        prisma.pdf.count({ where: { status: "PENDING" } }),
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.wallet.findUnique({
            where: { userId: user.id },
            select: { balance: true }
        }),
        prisma.purchase.count(),
        // Calculate total revenue from all purchases
        prisma.purchase.findMany({
            include: {
                pdf: {
                    select: { price: true }
                }
            }
        }),
        // Count completed teacher verifications
        prisma.pendingPayment.count({
            where: {
                type: "TEACHER_VERIFICATION",
                status: "COMPLETED"
            }
        })
    ]);

    // Calculate total sales revenue
    const totalRevenue = totalSalesRevenue.reduce((sum, purchase) => sum + purchase.pdf.price, 0);

    // Calculate expected platform earnings (25% of sales + teacher verifications)
    const expectedPlatformEarnings = Math.floor(totalRevenue * 0.25) + (teacherVerifications * 100);

    // Calculate teacher earnings (75% of sales)
    const totalTeacherEarnings = Math.floor(totalRevenue * 0.75);

    return (
        <div className="min-h-screen bg-background">
            <AdminNav />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
                        <p className="text-muted-foreground">Manage your platform</p>
                    </div>
                    {pendingPdfs > 0 && (
                        <Link
                            href="/admin/approvals"
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Review Pending ({pendingPdfs})</span>
                        </Link>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-muted-foreground text-sm font-medium">Total Teachers</h3>
                            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-foreground">{totalTeachers}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activeTeachers} active</p>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-muted-foreground text-sm font-medium">Total Students</h3>
                            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-foreground">{totalStudents}</p>
                        <p className="text-xs text-muted-foreground mt-1">Registered users</p>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-muted-foreground text-sm font-medium">Total Materials</h3>
                            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-foreground">{totalPdfs}</p>
                        <p className="text-xs text-muted-foreground mt-1">{pendingPdfs} pending approval</p>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-muted-foreground text-sm font-medium">Platform Wallet</h3>
                            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-primary">KES {platformWallet?.balance || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Current balance</p>
                    </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-muted-foreground text-sm font-medium">Total Sales</h3>
                            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <p className="text-2xl font-bold text-foreground">KES {totalRevenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">{totalPurchases} purchases</p>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-muted-foreground text-sm font-medium">Platform Earnings (25%)</h3>
                            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-2xl font-bold text-primary">KES {expectedPlatformEarnings.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Sales: KES {Math.floor(totalRevenue * 0.25)} + Verifications: KES {teacherVerifications * 100}
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-muted-foreground text-sm font-medium">Teacher Earnings (75%)</h3>
                            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p className="text-2xl font-bold text-foreground">KES {totalTeacherEarnings.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">Distributed to teachers</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link
                                href="/admin/approvals"
                                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors group"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Review Materials</h3>
                                        <p className="text-sm text-muted-foreground">Approve or reject uploads</p>
                                    </div>
                                </div>
                                {pendingPdfs > 0 && (
                                    <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                                        {pendingPdfs}
                                    </span>
                                )}
                            </Link>

                            <Link
                                href="/admin/teachers"
                                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors group"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Manage Teachers</h3>
                                        <p className="text-sm text-muted-foreground">View and manage teacher accounts</p>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href="/admin/materials"
                                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors group"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">All Materials</h3>
                                        <p className="text-sm text-muted-foreground">View all uploaded materials</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-xl font-bold text-foreground mb-4">Revenue Breakdown</h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-accent/50 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Revenue Split</p>
                                        <p className="text-lg font-bold text-foreground">Teachers: 75% | Platform: 25%</p>
                                    </div>
                                </div>
                                <div className="w-full bg-background rounded-full h-3 overflow-hidden">
                                    <div className="flex h-full">
                                        <div className="bg-green-600" style={{ width: '75%' }}></div>
                                        <div className="bg-primary" style={{ width: '25%' }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                                        <span className="text-sm font-medium text-foreground">Platform Commission</span>
                                    </div>
                                    <span className="text-sm font-bold text-primary">KES {Math.floor(totalRevenue * 0.25)}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                                        <span className="text-sm font-medium text-foreground">Teacher Verifications</span>
                                    </div>
                                    <span className="text-sm font-bold text-primary">KES {teacherVerifications * 100}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border-2 border-primary">
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-bold text-foreground">Total Platform Earnings</span>
                                    </div>
                                    <span className="text-lg font-bold text-primary">KES {expectedPlatformEarnings}</span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-border">
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p>• {totalPurchases} total purchases completed</p>
                                    <p>• {teacherVerifications} teachers verified</p>
                                    <p>• Current wallet balance: KES {platformWallet?.balance || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
