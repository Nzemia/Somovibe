import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProfileForm from "./ProfileForm";
import PasswordChangeForm from "@/components/PasswordChangeForm";

export default async function TeacherProfilePage() {
    const user = await getCurrentUser();

    if (!user || user.role !== "TEACHER") {
        redirect("/");
    }

    // Get teacher stats
    const [materials, wallet, teacherProfile] = await Promise.all([
        prisma.pdf.findMany({
            where: { teacherId: user.id },
            include: {
                purchases: {
                    select: { id: true },
                },
            },
        }),
        prisma.wallet.findUnique({
            where: { userId: user.id },
            select: { balance: true },
        }),
        prisma.teacherProfile.findUnique({
            where: { userId: user.id },
        }),
    ]);

    const totalSales = materials.reduce((sum, m) => sum + m.purchases.length, 0);
    const approvedMaterials = materials.filter((m) => m.status === "APPROVED").length;

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
                        <p className="text-muted-foreground">
                            Manage your account information
                        </p>
                    </div>
                    <Link
                        href="/teacher"
                        className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 transition-colors inline-flex items-center justify-center space-x-2"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        <span>Back to Dashboard</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Information</CardTitle>
                                <CardDescription>
                                    Update your personal details
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ProfileForm user={user} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>
                                    Update your password to keep your account secure
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PasswordChangeForm />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Account Details</CardTitle>
                                <CardDescription>
                                    Your account information and status
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            Account Type
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Your current role
                                        </p>
                                    </div>
                                    <Badge variant="default">Teacher</Badge>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            Verification Status
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Teacher verification
                                        </p>
                                    </div>
                                    {teacherProfile?.isActive ? (
                                        <Badge variant="default">Verified</Badge>
                                    ) : (
                                        <Badge variant="secondary">Pending</Badge>
                                    )}
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            Member Since
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Account creation date
                                        </p>
                                    </div>
                                    <p className="text-sm font-medium text-foreground">
                                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            Account Status
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Your account is active
                                        </p>
                                    </div>
                                    <Badge variant="default">Active</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stats Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Teaching Stats</CardTitle>
                                <CardDescription>Your performance overview</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">
                                            Materials
                                        </p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {materials.length}
                                        </p>
                                    </div>
                                    <svg
                                        className="w-8 h-8 text-primary"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">
                                            Approved
                                        </p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {approvedMaterials}
                                        </p>
                                    </div>
                                    <svg
                                        className="w-8 h-8 text-green-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">
                                            Total Sales
                                        </p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {totalSales}
                                        </p>
                                    </div>
                                    <svg
                                        className="w-8 h-8 text-primary"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                        />
                                    </svg>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">
                                            Wallet Balance
                                        </p>
                                        <p className="text-2xl font-bold text-primary">
                                            KES {wallet?.balance || 0}
                                        </p>
                                    </div>
                                    <svg
                                        className="w-8 h-8 text-primary"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <svg
                                        className="w-12 h-12 mx-auto text-primary mb-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                    <h3 className="font-bold text-foreground mb-2">
                                        Track Your Performance
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        View detailed analytics of your materials
                                    </p>
                                    <Link
                                        href="/teacher/analytics"
                                        className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity text-sm"
                                    >
                                        View Analytics
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
