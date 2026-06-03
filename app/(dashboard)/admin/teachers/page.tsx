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
import TeacherActions from "./TeacherActions";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import TeachersFilter from "./TeachersFilter";

const ITEMS_PER_PAGE = 10;

export default async function ManageTeachersPage({
    searchParams,
}: {
    searchParams: Promise<{
        page?: string;
        status?: string;
        search?: string;
    }>;
}) {
    const user = await getCurrentUser();
    const params = await searchParams;

    if (!user || user.role !== "ADMIN") {
        redirect("/admin/unauthorized");
    }

    const currentPage = Math.max(1, Number(params.page) || 1);
    const statusFilter = params.status || "all";
    const searchFilter = params.search || "";

    const skip = (currentPage - 1) * ITEMS_PER_PAGE;

    // Build the query where clause
    const whereClause: any = {
        role: "TEACHER",
    };

    if (statusFilter === "active") {
        whereClause.teacherProfile = { isActive: true };
    } else if (statusFilter === "pending") {
        whereClause.teacherProfile = { isActive: false };
    }

    if (searchFilter.trim()) {
        whereClause.OR = [
            { email: { contains: searchFilter.trim(), mode: "insensitive" } },
            { name: { contains: searchFilter.trim(), mode: "insensitive" } },
            { phone: { contains: searchFilter.trim(), mode: "insensitive" } },
        ];
    }

    // Fetch stats globally and filtered teachers in parallel
    const [
        totalTeachersCount,
        activeTeachersCount,
        pendingTeachersCount,
        totalUploadsCount,
        teachers,
        totalFilteredCount,
    ] = await Promise.all([
        prisma.user.count({ where: { role: "TEACHER" } }),
        prisma.user.count({
            where: {
                role: "TEACHER",
                teacherProfile: { isActive: true },
            },
        }),
        prisma.user.count({
            where: {
                role: "TEACHER",
                teacherProfile: { isActive: false },
            },
        }),
        prisma.pdf.count(),
        prisma.user.findMany({
            where: whereClause,
            include: {
                teacherProfile: true,
                pdfs: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
                wallets: {
                    select: {
                        balance: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: ITEMS_PER_PAGE,
        }),
        prisma.user.count({
            where: whereClause,
        }),
    ]);

    const totalPages = Math.ceil(totalFilteredCount / ITEMS_PER_PAGE);

    // Build URL helper for pagination links
    const getPageUrl = (pageNumber: number) => {
        const queryParams = new URLSearchParams();
        if (pageNumber > 1) queryParams.set("page", pageNumber.toString());
        if (statusFilter !== "all") queryParams.set("status", statusFilter);
        if (searchFilter) queryParams.set("search", searchFilter);
        const str = queryParams.toString();
        return str ? `?${str}` : "?";
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Manage Teachers</h1>
                        <p className="text-muted-foreground">
                            View and manage all teacher accounts
                        </p>
                    </div>
                </div>

                {/* Filter and Search controls */}
                <TeachersFilter currentStatus={params.status} currentSearch={params.search} />

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Total Teachers</p>
                        <p className="text-2xl font-bold text-foreground">{totalTeachersCount}</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Active</p>
                        <p className="text-2xl font-bold text-primary">{activeTeachersCount}</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Pending Verification</p>
                        <p className="text-2xl font-bold text-orange-500">{pendingTeachersCount}</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Total Uploads</p>
                        <p className="text-2xl font-bold text-foreground">{totalUploadsCount}</p>
                    </div>
                </div>

                {/* Teachers Table */}
                <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
                    {teachers.length === 0 ? (
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
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                No teachers found
                            </h3>
                            <p className="text-muted-foreground">
                                Adjust your filters or check for typos
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Uploads</TableHead>
                                        <TableHead>Wallet</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teachers.map((teacher) => {
                                        const isActive = teacher.teacherProfile?.isActive;
                                        const approvedPdfs = teacher.pdfs.filter(
                                            (p) => p.status === "APPROVED"
                                        ).length;
                                        const walletBalance = teacher.wallets?.[0]?.balance || 0;

                                        return (
                                            <TableRow key={teacher.id}>
                                                <TableCell className="font-medium">
                                                    {teacher.email}
                                                </TableCell>
                                                <TableCell>
                                                    {teacher.phone || (
                                                        <span className="text-muted-foreground">
                                                            Not set
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isActive ? (
                                                        <Badge variant="default">Active</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            Pending
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium">
                                                            {teacher.pdfs.length}
                                                        </span>
                                                        {approvedPdfs > 0 && (
                                                            <span className="text-xs text-muted-foreground">
                                                                ({approvedPdfs} approved)
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium text-primary">
                                                        KES {walletBalance}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(
                                                        teacher.createdAt
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <TeacherActions teacher={teacher} />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3 sm:px-6 mt-6 rounded-lg shadow-sm">
                        <div className="flex flex-1 justify-between sm:hidden">
                            {currentPage > 1 ? (
                                <Link
                                    href={getPageUrl(currentPage - 1)}
                                    className="relative inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
                                >
                                    Previous
                                </Link>
                            ) : (
                                <span className="relative inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed">
                                    Previous
                                </span>
                            )}
                            {currentPage < totalPages ? (
                                <Link
                                    href={getPageUrl(currentPage + 1)}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
                                >
                                    Next
                                </Link>
                            ) : (
                                <span className="relative ml-3 inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed">
                                    Next
                                </span>
                            )}
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Showing <span className="font-semibold text-foreground">{skip + 1}</span> to{" "}
                                    <span className="font-semibold text-foreground">
                                        {Math.min(skip + ITEMS_PER_PAGE, totalFilteredCount)}
                                    </span>{" "}
                                    of <span className="font-semibold text-foreground">{totalFilteredCount}</span> results
                                </p>
                            </div>
                            <div>
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href={currentPage > 1 ? getPageUrl(currentPage - 1) : "#"}
                                                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: totalPages }).map((_, i) => (
                                            <PaginationItem key={i}>
                                                <PaginationLink
                                                    href={getPageUrl(i + 1)}
                                                    isActive={currentPage === i + 1}
                                                >
                                                    {i + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                href={currentPage < totalPages ? getPageUrl(currentPage + 1) : "#"}
                                                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
