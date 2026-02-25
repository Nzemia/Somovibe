import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
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

export default async function ManageTeachersPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
        redirect("/admin/unauthorized");
    }

    const teachers = await prisma.user.findMany({
        where: { role: "TEACHER" },
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
    });

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Manage Teachers</h1>
                    <p className="text-muted-foreground">
                        View and manage all teacher accounts
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Total Teachers</p>
                        <p className="text-2xl font-bold text-foreground">{teachers.length}</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Active</p>
                        <p className="text-2xl font-bold text-primary">
                            {teachers.filter((t) => t.teacherProfile?.isActive).length}
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Pending Verification</p>
                        <p className="text-2xl font-bold text-orange-500">
                            {teachers.filter((t) => !t.teacherProfile?.isActive).length}
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Total Uploads</p>
                        <p className="text-2xl font-bold text-foreground">
                            {teachers.reduce((sum, t) => sum + t.pdfs.length, 0)}
                        </p>
                    </div>
                </div>

                {/* Teachers Table */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
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
                                No teachers yet
                            </h3>
                            <p className="text-muted-foreground">
                                Teachers will appear here once they register
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
            </div>
        </div>
    );
}
