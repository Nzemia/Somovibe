import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import SuccessToast from "./SuccessToast";

export default async function TeacherPage({
    searchParams,
}: {
    searchParams: Promise<{ verified?: string; upload?: string }>;
}) {
    const user = await getCurrentUser();
    const params = await searchParams;

    if (!user || user.role !== "TEACHER") {
        redirect("/");
    }

    // Fetch teacher data
    const [materials, wallet, teacherProfile] = await Promise.all([
        prisma.pdf.findMany({
            where: { teacherId: user.id },
            include: {
                purchases: {
                    select: { id: true },
                },
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma.wallet.findUnique({
            where: { userId: user.id },
            select: { balance: true },
        }),
        prisma.teacherProfile.findUnique({
            where: { userId: user.id },
        }),
    ]);

    const stats = {
        totalUploads: materials.length,
        pending: materials.filter((m) => m.status === "PENDING").length,
        approved: materials.filter((m) => m.status === "APPROVED").length,
        rejected: materials.filter((m) => m.status === "REJECTED").length,
        totalSales: materials.reduce((sum, m) => sum + m.purchases.length, 0),
        walletBalance: wallet?.balance || 0,
    };

    return (
        <div className="min-h-screen bg-background">
            <SuccessToast verified={params.verified} uploaded={params.upload} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Teacher Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your materials and track earnings
                        </p>
                    </div>
                    <Link
                        href="/teacher/upload"
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
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
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        <span>Upload Material</span>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                        <h3 className="text-muted-foreground text-xs md:text-sm font-medium mb-2">
                            Total Uploads
                        </h3>
                        <p className="text-2xl md:text-3xl font-bold text-foreground">
                            {stats.totalUploads}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.pending} pending approval
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                        <h3 className="text-muted-foreground text-xs md:text-sm font-medium mb-2">
                            Approved
                        </h3>
                        <p className="text-2xl md:text-3xl font-bold text-green-600">
                            {stats.approved}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Live on marketplace
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                        <h3 className="text-muted-foreground text-xs md:text-sm font-medium mb-2">
                            Total Sales
                        </h3>
                        <p className="text-2xl md:text-3xl font-bold text-foreground">
                            {stats.totalSales}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Across all materials
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                        <h3 className="text-muted-foreground text-xs md:text-sm font-medium mb-2">
                            Wallet Balance
                        </h3>
                        <p className="text-2xl md:text-3xl font-bold text-primary">
                            KES {stats.walletBalance}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Available to withdraw
                        </p>
                    </div>
                </div>

                {/* Quick Actions & Earnings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-xl font-bold text-foreground mb-4">
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
                            <Link
                                href="/teacher/upload"
                                className="p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left group"
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
                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">
                                            Upload New Material
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Share your teaching resources
                                        </p>
                                    </div>
                                </div>
                            </Link>
                            <Link
                                href="/teacher/analytics"
                                className="p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left group"
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
                                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">
                                            Material Analytics
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Track views, sales, and earnings
                                        </p>
                                    </div>
                                </div>
                            </Link>
                            <Link
                                href="/teacher/wallet"
                                className="p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left group"
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
                                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">
                                            View Wallet
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Check earnings and withdraw
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-xl font-bold text-foreground mb-4">
                            Earnings Breakdown
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                                <div>
                                    <p className="text-sm text-muted-foreground">Your Share</p>
                                    <p className="text-2xl font-bold text-primary">75%</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Platform Fee</p>
                                    <p className="text-2xl font-bold text-foreground">25%</p>
                                </div>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-2">
                                <p>• You earn KES 75 from every KES 100 sale</p>
                                <p>• Instant credit to your wallet</p>
                                <p>• Withdraw anytime via M-Pesa</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* My Materials */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <h2 className="text-xl font-bold text-foreground">My Materials</h2>
                    </div>

                    {materials.length === 0 ? (
                        <div className="text-center py-12 px-4">
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
                                No materials uploaded yet
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Start sharing your teaching resources and earn money
                            </p>
                            <Link
                                href="/teacher/upload"
                                className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
                            >
                                Upload Your First Material
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Sales</TableHead>
                                        <TableHead>Uploaded</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {materials.map((material) => (
                                        <TableRow key={material.id}>
                                            <TableCell className="font-medium max-w-xs">
                                                <div className="truncate" title={material.title}>
                                                    {material.title}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {material.description}
                                                </div>
                                            </TableCell>
                                            <TableCell>{material.subject}</TableCell>
                                            <TableCell>{material.grade}</TableCell>
                                            <TableCell className="font-medium text-primary">
                                                KES {material.price}
                                            </TableCell>
                                            <TableCell>
                                                {material.status === "APPROVED" && (
                                                    <Badge variant="default">Approved</Badge>
                                                )}
                                                {material.status === "PENDING" && (
                                                    <Badge variant="secondary">Pending</Badge>
                                                )}
                                                {material.status === "REJECTED" && (
                                                    <Badge variant="destructive">Rejected</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">
                                                    {material.purchases.length}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(
                                                    material.createdAt
                                                ).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
