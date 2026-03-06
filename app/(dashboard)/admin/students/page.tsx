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
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 10;

export default async function ManageStudentsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const user = await getCurrentUser();
    const params = await searchParams;

    if (!user || user.role !== "ADMIN") {
        redirect("/admin/unauthorized");
    }

    const currentPage = Number(params.page) || 1;
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;

    const [students, totalStudents] = await Promise.all([
        prisma.user.findMany({
            where: { role: "STUDENT" },
            include: {
                purchases: {
                    select: { id: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: ITEMS_PER_PAGE,
        }),
        prisma.user.count({
            where: { role: "STUDENT" },
        }),
    ]);

    const totalPages = Math.ceil(totalStudents / ITEMS_PER_PAGE);

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Manage Students</h1>
                        <p className="text-muted-foreground">
                            View and manage all student accounts
                        </p>
                    </div>
                    <Link
                        href="/admin"
                        className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 transition-colors inline-flex items-center justify-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Dashboard</span>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Total Students</p>
                        <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Students on Current Page</p>
                        <p className="text-2xl font-bold text-primary">{students.length}</p>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
                    {students.length === 0 ? (
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
                                No students yet
                            </h3>
                            <p className="text-muted-foreground">
                                Students will appear here once they register
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Purchases</TableHead>
                                        <TableHead>Joined</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">
                                                {student.email}
                                            </TableCell>
                                            <TableCell>
                                                {student.phone || (
                                                    <span className="text-muted-foreground">
                                                        Not set
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="px-2">
                                                    {student.purchases.length} materials
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(student.createdAt).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    href={currentPage > 1 ? `?page=${currentPage - 1}` : "#"} 
                                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                            
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink 
                                        href={`?page=${i + 1}`}
                                        isActive={currentPage === i + 1}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            
                            <PaginationItem>
                                <PaginationNext 
                                    href={currentPage < totalPages ? `?page=${currentPage + 1}` : "#"} 
                                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </div>
    );
}
