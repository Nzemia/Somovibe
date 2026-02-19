import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getMaterialTypeConfig } from "@/lib/materialTypes";
import { getAverageRating } from "@/lib/utils";
import { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ teacherId: string }>;
}): Promise<Metadata> {
    const { teacherId } = await params;

    const teacher = await prisma.user.findUnique({
        where: { id: teacherId, role: "TEACHER" },
        select: {
            name: true,
            email: true,
            teacherProfile: {
                select: {
                    isActive: true,
                },
            },
            _count: {
                select: {
                    pdfs: {
                        where: {
                            status: "APPROVED",
                        },
                    },
                },
            },
        },
    });

    if (!teacher || !teacher.teacherProfile) {
        return {
            title: "Teacher Not Found",
        };
    }

    const teacherName = teacher.name || teacher.email.split("@")[0];
    const verified = teacher.teacherProfile.isActive ? "Verified" : "";

    return {
        title: `${teacherName} - ${verified} Teacher Profile`,
        description: `Browse ${teacher._count.pdfs} quality learning materials from ${teacherName}. ${verified ? "Verified teacher" : "Teacher"} on our platform.`,
        openGraph: {
            title: `${teacherName}'s Teaching Materials`,
            description: `Explore ${teacher._count.pdfs} learning materials from ${teacherName}`,
            type: "profile",
        },
    };
}

export default async function TeacherProfilePage({
    params,
}: {
    params: Promise<{ teacherId: string }>;
}) {
    const { teacherId } = await params;
    const currentUser = await getCurrentUser();

    // Fetch teacher info
    const teacher = await prisma.user.findUnique({
        where: { id: teacherId, role: "TEACHER" },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            teacherProfile: {
                select: {
                    isActive: true,
                },
            },
        },
    });

    if (!teacher || !teacher.teacherProfile) {
        notFound();
    }

    // Fetch teacher's approved materials
    const materials = await prisma.pdf.findMany({
        where: {
            teacherId: teacher.id,
            status: "APPROVED",
        },
        include: {
            _count: {
                select: {
                    downloads: true,
                    reviews: true,
                    purchases: true,
                },
            },
            reviews: {
                select: {
                    rating: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    // Get user's purchases if logged in
    const userPurchases = currentUser
        ? await prisma.purchase.findMany({
            where: { userId: currentUser.id },
            select: { pdfId: true },
        })
        : [];

    const purchasedPdfIds = new Set(userPurchases.map((p) => p.pdfId));

    // Calculate stats
    const totalDownloads = materials.reduce((sum, m) => sum + m._count.downloads, 0);
    const totalSales = materials.reduce((sum, m) => sum + m._count.purchases, 0);
    const avgRating =
        materials.length > 0
            ? materials.reduce((sum, m) => {
                const rating = getAverageRating(m.reviews);
                return sum + rating;
            }, 0) / materials.length
            : 0;

    return (
        <>
            <Navbar user={currentUser ? { email: currentUser.email, role: currentUser.role } : null} />
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Teacher Header */}
                    <div className="bg-card border border-border rounded-lg p-6 mb-8">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-foreground">
                                        {teacher.name || teacher.email.split("@")[0]}
                                    </h1>
                                    {teacher.teacherProfile.isActive && (
                                        <Badge className="bg-green-500 text-white">
                                            ✓ Verified Teacher
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-muted-foreground mb-4">
                                    Teaching since {new Date(teacher.createdAt).getFullYear()}
                                </p>

                                {/* Stats */}
                                <div className="flex items-center gap-6 text-sm">
                                    <div>
                                        <span className="font-semibold text-foreground">{materials.length}</span>
                                        <span className="text-muted-foreground ml-1">Materials</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-foreground">{totalSales}</span>
                                        <span className="text-muted-foreground ml-1">Sales</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-foreground">{totalDownloads}</span>
                                        <span className="text-muted-foreground ml-1">Downloads</span>
                                    </div>
                                    {avgRating > 0 && (
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="font-semibold text-foreground">{avgRating.toFixed(1)}</span>
                                            <span className="text-muted-foreground">Average Rating</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Materials Section */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-foreground mb-4">
                            Materials by {teacher.name || teacher.email.split("@")[0]}
                        </h2>
                    </div>

                    {materials.length === 0 ? (
                        <div className="text-center py-16 bg-card border border-border rounded-lg">
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
                            <h3 className="text-xl font-semibold text-foreground mb-2">No materials yet</h3>
                            <p className="text-muted-foreground">This teacher hasn't published any materials yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {materials.map((material) => {
                                const materialConfig = getMaterialTypeConfig(material.materialType);
                                const avgRating = getAverageRating(material.reviews);
                                const isPurchased = purchasedPdfIds.has(material.id);

                                return (
                                    <Link
                                        key={material.id}
                                        href={`/marketplace/${material.id}`}
                                        className="block group"
                                    >
                                        <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                                            {/* Thumbnail */}
                                            <div className="relative aspect-video bg-muted overflow-hidden">
                                                {material.thumbnailUrl ? (
                                                    <img
                                                        src={material.thumbnailUrl}
                                                        alt={material.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className={`w-full h-full flex items-center justify-center ${materialConfig.lightColor}`}>
                                                        <span className="text-6xl">{materialConfig.icon}</span>
                                                    </div>
                                                )}
                                                {isPurchased && (
                                                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-lg">
                                                        ✓ Owned
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-4 flex flex-col flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                                                        {material.subject}
                                                    </span>
                                                    <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded">
                                                        {material.grade}
                                                    </span>
                                                </div>

                                                <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                    {material.title}
                                                </h3>

                                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
                                                    {material.description}
                                                </p>

                                                <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                            </svg>
                                                            <span>{material._count.downloads}</span>
                                                        </div>
                                                        {avgRating > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <svg className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                                <span>{avgRating.toFixed(1)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-3 border-t border-border">
                                                    <div className="text-lg font-bold text-foreground">
                                                        KES {material.price}
                                                    </div>
                                                    <span className="text-sm text-primary font-medium">
                                                        View Details →
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
