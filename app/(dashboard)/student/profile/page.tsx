import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProfileForm from "./ProfileForm"
import PasswordChangeForm from "@/components/PasswordChangeForm"

export default async function StudentProfilePage() {
    const user = await getCurrentUser()

    if (!user || user.role !== "STUDENT") {
        redirect("/")
    }

    // Get user stats
    const purchases = await prisma.purchase.findMany({
        where: { userId: user.id },
        include: {
            pdf: {
                select: {
                    price: true,
                    subject: true
                }
            }
        }
    })

    const totalSpent = purchases.reduce(
        (sum, p) => sum + p.pdf.price,
        0
    )
    const uniqueSubjects = new Set(
        purchases.map(p => p.pdf.subject)
    )

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            My Profile
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your account information
                        </p>
                    </div>
                    <Link
                        href="/student"
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
                                <CardTitle>
                                    Account Information
                                </CardTitle>
                                <CardDescription>
                                    Update your personal
                                    details
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ProfileForm user={user} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Change Password
                                </CardTitle>
                                <CardDescription>
                                    Update your password to
                                    keep your account secure
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PasswordChangeForm />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Account Details
                                </CardTitle>
                                <CardDescription>
                                    Your account information
                                    and status
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            Account Type
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Your current
                                            role
                                        </p>
                                    </div>
                                    <Badge variant="secondary">
                                        Student
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            Member Since
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Account creation
                                            date
                                        </p>
                                    </div>
                                    <p className="text-sm font-medium text-foreground">
                                        {new Date(
                                            user.createdAt
                                        ).toLocaleDateString(
                                            "en-US",
                                            {
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric"
                                            }
                                        )}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            Account Status
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Your account is
                                            active
                                        </p>
                                    </div>
                                    <Badge variant="default">
                                        Active
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stats Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Learning Stats
                                </CardTitle>
                                <CardDescription>
                                    Your progress overview
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">
                                            Materials
                                        </p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {
                                                purchases.length
                                            }
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
                                            Total Spent
                                        </p>
                                        <p className="text-2xl font-bold text-primary">
                                            KES {totalSpent}
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

                                <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">
                                            Subjects
                                        </p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {
                                                uniqueSubjects.size
                                            }
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
                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                        />
                                    </svg>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Quick Links
                                </CardTitle>
                                <CardDescription>
                                    Helpful resources
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link
                                    href="/marketplace"
                                    className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors group"
                                >
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <svg
                                                className="w-5 h-5 text-primary"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={
                                                        2
                                                    }
                                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            Browse
                                            Marketplace
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Find new
                                            materials
                                        </p>
                                    </div>
                                </Link>

                                <Link
                                    href="/student/downloads"
                                    className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors group"
                                >
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <svg
                                                className="w-5 h-5 text-primary"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={
                                                        2
                                                    }
                                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            Download History
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            View all
                                            downloads
                                        </p>
                                    </div>
                                </Link>

                                <Link
                                    href="/about"
                                    className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors group"
                                >
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <svg
                                                className="w-5 h-5 text-primary"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={
                                                        2
                                                    }
                                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            About Somovibe
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Learn more about
                                            us
                                        </p>
                                    </div>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
