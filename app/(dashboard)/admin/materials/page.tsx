import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import MaterialActions from "./MaterialActions";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import MaterialsFilter from "./MaterialsFilter";

export default async function AllMaterialsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; page?: string }>;
}) {
    const params = await searchParams;
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
        redirect("/admin/unauthorized");
    }

    const statusFilter = params.status;
    const page = Math.max(1, parseInt(params.page || "1", 10));
    const LIMIT = 10;
    const skip = (page - 1) * LIMIT;

    // 1. Fetch unpaginated lightweight list for exact stats
    const allMaterialsForStats = await prisma.pdf.findMany({
        where: statusFilter ? { status: statusFilter as any } : undefined,
        select: {
            status: true,
            purchases: {
                select: { id: true }
            }
        }
    });

    const stats = {
        total: allMaterialsForStats.length,
        approved: allMaterialsForStats.filter((m) => m.status === "APPROVED").length,
        pending: allMaterialsForStats.filter((m) => m.status === "PENDING").length,
        rejected: allMaterialsForStats.filter((m) => m.status === "REJECTED").length,
        totalSales: allMaterialsForStats.reduce((sum, m) => sum + m.purchases.length, 0),
    };

    // 2. Fetch the paginated list of materials for the page view
    const materials = await prisma.pdf.findMany({
        where: statusFilter ? { status: statusFilter as any } : undefined,
        include: {
            teacher: {
                select: {
                    email: true,
                },
            },
            purchases: {
                select: {
                    id: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: LIMIT,
        skip: skip,
    });

    const totalPages = Math.ceil(stats.total / LIMIT);

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">All Materials</h1>
                        <p className="text-muted-foreground">
                            View and manage all uploaded learning materials
                        </p>
                    </div>
                   
                </div>

                {/* Filter */}
                <MaterialsFilter currentStatus={statusFilter} />

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Total</p>
                        <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Approved</p>
                        <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Pending</p>
                        <p className="text-2xl font-bold text-orange-500">{stats.pending}</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Rejected</p>
                        <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
                        <p className="text-2xl font-bold text-primary">{stats.totalSales}</p>
                    </div>
                </div>

                {/* Materials Table */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    {materials.length === 0 ? (
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
                                No materials yet
                            </h3>
                            <p className="text-muted-foreground">
                                Materials will appear here once teachers upload them
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Teacher</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Sales</TableHead>
                                        <TableHead>Uploaded</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
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
                                            <TableCell className="text-sm">
                                                {material.teacher.email}
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
                                            <TableCell className="text-right">
                                                <MaterialActions material={material} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3 sm:px-6 mt-6 rounded-lg shadow-sm">
                        <div className="flex flex-1 justify-between sm:hidden">
                            {page > 1 ? (
                                <Link
                                    href={`/admin/materials?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
                                    className="relative inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
                                >
                                    Previous
                                </Link>
                            ) : (
                                <span className="relative inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed">
                                    Previous
                                </span>
                            )}
                            {page < totalPages ? (
                                <Link
                                    href={`/admin/materials?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
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
                                        {Math.min(skip + LIMIT, stats.total)}
                                    </span>{" "}
                                    of <span className="font-semibold text-foreground">{stats.total}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
                                    {/* Previous */}
                                    {page > 1 ? (
                                        <Link
                                            href={`/admin/materials?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
                                            className="relative inline-flex items-center rounded-l-md px-3 py-2 text-muted-foreground border border-border hover:bg-accent hover:text-foreground text-sm font-medium transition-colors"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                            </svg>
                                        </Link>
                                    ) : (
                                        <span className="relative inline-flex items-center rounded-l-md px-3 py-2 text-muted-foreground border border-border opacity-40 cursor-not-allowed text-sm font-medium">
                                            <span className="sr-only">Previous</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    )}

                                    {/* Page Numbers */}
                                    {Array.from({ length: totalPages }).map((_, index) => {
                                        const p = index + 1;
                                        const isCurrent = p === page;
                                        return (
                                            <Link
                                                key={p}
                                                href={`/admin/materials?page=${p}${statusFilter ? `&status=${statusFilter}` : ""}`}
                                                aria-current={isCurrent ? "page" : undefined}
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold border border-border transition-colors ${
                                                    isCurrent
                                                        ? "z-10 bg-[#008c43] text-white border-[#008c43]"
                                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                                }`}
                                            >
                                                {p}
                                            </Link>
                                        );
                                    })}

                                    {/* Next */}
                                    {page < totalPages ? (
                                        <Link
                                            href={`/admin/materials?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
                                            className="relative inline-flex items-center rounded-r-md px-3 py-2 text-muted-foreground border border-border hover:bg-accent hover:text-foreground text-sm font-medium transition-colors"
                                        >
                                            <span className="sr-only">Next</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                            </svg>
                                        </Link>
                                    ) : (
                                        <span className="relative inline-flex items-center rounded-r-md px-3 py-2 text-muted-foreground border border-border opacity-40 cursor-not-allowed text-sm font-medium">
                                            <span className="sr-only">Next</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    )}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
