import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function StudentPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== "STUDENT") {
        redirect("/");
    }

    // Fetch student purchases
    const purchases = await prisma.purchase.findMany({
        where: { userId: user.id },
        include: {
            pdf: {
                include: {
                    teacher: {
                        select: {
                            email: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    // Calculate stats
    const totalSpent = purchases.reduce((sum, p) => sum + p.pdf.price, 0);
    const uniqueSubjects = new Set(purchases.map((p) => p.pdf.subject)).size;

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Student Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Track your learning materials and progress
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Purchased Materials</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-foreground">
                                {purchases.length}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Learning resources
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Total Spent</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-primary">
                                KES {totalSpent.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                All time investment
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Subjects</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-foreground">
                                {uniqueSubjects}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Different subjects
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions & Become Teacher */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link
                                href="/marketplace"
                                className="block p-4 border border-border rounded-lg hover:bg-accent transition-colors group"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                        <svg
                                            className="w-6 h-6 text-primary"
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
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">
                                            Browse Marketplace
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Find quality learning materials
                                        </p>
                                    </div>
                                </div>
                            </Link>
                            <Link
                                href="/student/downloads"
                                className="block p-4 border border-border rounded-lg hover:bg-accent transition-colors group"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                        <svg
                                            className="w-6 h-6 text-primary"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">
                                            Download History
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            View all your downloads
                                        </p>
                                    </div>
                                </div>
                            </Link>
                            <Link
                                href="/student/profile"
                                className="block p-4 border border-border rounded-lg hover:bg-accent transition-colors group"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                        <svg
                                            className="w-6 h-6 text-primary"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">
                                            Manage Profile
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Update your information
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                        <CardContent className="pt-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="w-12 h-12 text-primary"
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
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-foreground mb-2">
                                        Want to share your knowledge?
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Become a teacher and earn 75% from every sale. One-time
                                        verification fee of KES 100.
                                    </p>
                                    <Link
                                        href="/teacher-register"
                                        className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
                                    >
                                        Become a Teacher
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* My Purchases */}
                <Card>
                    <CardHeader>
                        <CardTitle>My Purchases</CardTitle>
                        <CardDescription>
                            All your purchased learning materials
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {purchases.length === 0 ? (
                            <div className="text-center py-12">
                                <svg
                                    className="w-16 h-16 mx-auto text-muted-foreground mb-4"
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
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    No purchases yet
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Start exploring the marketplace to find quality learning
                                    materials
                                </p>
                                <Link
                                    href="/marketplace"
                                    className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
                                >
                                    Browse Marketplace
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Material</TableHead>
                                            <TableHead>Teacher</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Grade</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Purchased</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {purchases.map((purchase) => (
                                            <TableRow key={purchase.id}>
                                                <TableCell className="font-medium max-w-xs">
                                                    <div
                                                        className="truncate"
                                                        title={purchase.pdf.title}
                                                    >
                                                        {purchase.pdf.title}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground truncate">
                                                        {purchase.pdf.description}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {purchase.pdf.teacher.email}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">
                                                        {purchase.pdf.subject}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{purchase.pdf.grade}</TableCell>
                                                <TableCell className="font-medium text-primary">
                                                    KES {purchase.pdf.price}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {new Date(
                                                        purchase.createdAt
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link
                                                        href={`/api/pdf/download?pdfId=${purchase.pdf.id}`}
                                                        className="inline-flex items-center space-x-1 text-primary hover:underline"
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                            />
                                                        </svg>
                                                        <span className="text-sm">Download</span>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
