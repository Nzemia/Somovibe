import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
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
    searchParams: Promise<{ status?: string }>;
}) {
    const params = await searchParams;
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
        redirect("/admin/unauthorized");
    }

    const statusFilter = params.status;

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
    });

    const stats = {
        total: materials.length,
        approved: materials.filter((m) => m.status === "APPROVED").length,
        pending: materials.filter((m) => m.status === "PENDING").length,
        rejected: materials.filter((m) => m.status === "REJECTED").length,
        totalSales: materials.reduce((sum, m) => sum + m.purchases.length, 0),
    };

    return (
        <div className="min-h-screen bg-background">
            <AdminNav />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">All Materials</h1>
                    <p className="text-muted-foreground">
                        View and manage all uploaded learning materials
                    </p>
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
            </div>
        </div>
    );
}
