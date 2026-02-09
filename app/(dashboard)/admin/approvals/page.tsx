import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ApprovalActions from "@/app/(dashboard)/admin/approvals/ApprovalActions";
import { AdminNav } from "@/components/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminApprovalsPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
        redirect("/admin/unauthorized");
    }

    const pendingPdfs = await prisma.pdf.findMany({
        where: { status: "PENDING" },
        include: {
            teacher: {
                select: {
                    email: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen bg-background">
            <AdminNav />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Pending Approvals</h1>
                    <p className="text-muted-foreground">
                        Review and approve teacher-uploaded materials
                    </p>
                </div>

                {pendingPdfs.length === 0 ? (
                    <div className="bg-card border border-border rounded-lg p-12 text-center">
                        <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-foreground mb-2">All caught up!</h3>
                        <p className="text-muted-foreground">No pending materials to review</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingPdfs.map((pdf) => (
                            <div key={pdf.id} className="bg-card border border-border rounded-lg p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                                PENDING
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                Uploaded by {pdf.teacher.email}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-foreground mb-2">{pdf.title}</h3>
                                        <p className="text-muted-foreground mb-4">{pdf.description}</p>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Subject</p>
                                                <p className="font-medium text-foreground">{pdf.subject}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Grade</p>
                                                <p className="font-medium text-foreground">{pdf.grade}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Price</p>
                                                <p className="font-medium text-primary">KES {pdf.price}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Uploaded</p>
                                                <p className="font-medium text-foreground">
                                                    {new Date(pdf.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span>File: {pdf.fileUrl}</span>
                                        </div>
                                    </div>

                                    <ApprovalActions pdfId={pdf.id} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
