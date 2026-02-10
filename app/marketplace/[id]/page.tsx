import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { notFound } from "next/navigation";
import { getMaterialTypeConfig } from "@/lib/materialTypes";
import { getAverageRating, maskEmail } from "@/lib/utils";
import Link from "next/link";
import MaterialDetailClient from "./MaterialDetailClient";
import ReviewSection from "./ReviewSection";


type Props = {
    params: Promise<{ id: string }>;
};

export default async function MaterialDetailPage({ params }: Props) {
    const { id } = await params;
    const user = await getCurrentUser();

    // Fetch material with teacher info and purchase count
    const material = await prisma.pdf.findUnique({
        where: { id, status: "APPROVED" },
        include: {
            teacher: {
                select: {
                    id: true,
                    email: true,
                },
            },
            purchases: {
                select: {
                    id: true,
                },
            },
            reviews: {
                include: {
                    user: {
                        select: {
                            email: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 3,
            },
        },
    });

    if (!material) {
        notFound();
    }

    // Track view (async, don't await)
    prisma.materialView.create({
        data: {
            pdfId: material.id,
            userId: user?.id || null,
        },
    }).catch(() => { }); // Ignore errors for view tracking

    // Check if user has purchased
    const hasPurchased = user
        ? await prisma.purchase.findUnique({
            where: {
                userId_pdfId: {
                    userId: user.id,
                    pdfId: material.id,
                },
            },
        })
        : null;

    // Get related materials (same subject and grade, different material)
    const relatedMaterials = await prisma.pdf.findMany({
        where: {
            status: "APPROVED",
            subject: material.subject,
            grade: material.grade,
            id: { not: material.id },
        },
        include: {
            teacher: {
                select: {
                    email: true,
                },
            },
            _count: {
                select: {
                    downloads: true,
                    reviews: true,
                },
            },
            reviews: {
                select: {
                    rating: true,
                },
            },
        },
        take: 3,
        orderBy: { createdAt: "desc" },
    });

    // Get more materials from same teacher
    const teacherMaterials = await prisma.pdf.findMany({
        where: {
            status: "APPROVED",
            teacherId: material.teacherId,
            id: { not: material.id },
        },
        include: {
            teacher: {
                select: {
                    email: true,
                },
            },
            _count: {
                select: {
                    downloads: true,
                    reviews: true,
                },
            },
            reviews: {
                select: {
                    rating: true,
                },
            },
        },
        take: 3,
        orderBy: { createdAt: "desc" },
    });

    const materialConfig = getMaterialTypeConfig(material.materialType);

    return (
        <>
            <Navbar user={user ? { email: user.email, role: user.role } : null} />
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Breadcrumb */}
                    <div className="mb-6 flex items-center space-x-2 text-sm text-muted-foreground">
                        <Link href="/marketplace" className="hover:text-foreground transition-colors">
                            Marketplace
                        </Link>
                        <span>›</span>
                        <span className="text-foreground">{material.title}</span>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Mobile: Purchase Card First */}
                        <div className="lg:hidden">
                            <MaterialDetailClient
                                material={{
                                    id: material.id,
                                    title: material.title,
                                    price: material.price,
                                    materialType: material.materialType,
                                }}
                                hasPurchased={!!hasPurchased}
                                user={user ? { id: user.id, email: user.email, phone: user.phone, role: user.role } : null}
                            />
                        </div>

                        {/* Left Column - Material Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Material Type Badge */}
                            <div className={`${materialConfig.lightColor} border-2 ${materialConfig.borderColor} rounded-lg p-6`}>
                                <div className="flex items-center space-x-3 mb-4">
                                    <span className="text-4xl">{materialConfig.icon}</span>
                                    <div>
                                        <h3 className={`text-lg font-semibold ${materialConfig.textColor}`}>
                                            {materialConfig.label}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {material.purchases.length} {material.purchases.length === 1 ? 'sale' : 'sales'}
                                        </p>
                                    </div>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                    {material.title}
                                </h1>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                                        {material.subject}
                                    </span>
                                    <span className="px-3 py-1 bg-accent text-foreground text-sm font-medium rounded-full">
                                        {material.grade}
                                    </span>
                                    {hasPurchased && (
                                        <span className="px-3 py-1 bg-green-500/20 text-green-700 dark:text-green-300 text-sm font-medium rounded-full">
                                            ✓ Purchased
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-card border border-border rounded-lg p-6">
                                <h2 className="text-xl font-bold text-foreground mb-4">Description</h2>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {material.description}
                                </p>
                            </div>

                            {/* Material Info */}
                            <div className="bg-card border border-border rounded-lg p-6">
                                <h2 className="text-xl font-bold text-foreground mb-4">Material Information</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Subject</p>
                                        <p className="font-medium text-foreground">{material.subject}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Grade Level</p>
                                        <p className="font-medium text-foreground">{material.grade}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Material Type</p>
                                        <p className="font-medium text-foreground">{materialConfig.label}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
                                        <p className="font-medium text-foreground">{material.purchases.length}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Uploaded</p>
                                        <p className="font-medium text-foreground">
                                            {new Date(material.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Teacher</p>
                                        <p className="font-medium text-foreground">{material.teacher.email.split('@')[0]}</p>
                                    </div>
                                </div>
                            </div>

                            {/* More from this teacher */}
                            {teacherMaterials.length > 0 && (
                                <div className="bg-card border border-border rounded-lg p-6">
                                    <h2 className="text-xl font-bold text-foreground mb-4">
                                        More from {material.teacher.email.split('@')[0]}
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {teacherMaterials.map((mat) => {
                                            const config = getMaterialTypeConfig(mat.materialType);
                                            return (
                                                <Link
                                                    key={mat.id}
                                                    href={`/marketplace/${mat.id}`}
                                                    className="border border-border rounded-lg p-4 hover:bg-accent transition-colors"
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <span className="text-2xl">{config.icon}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">
                                                                {mat.title}
                                                            </h3>
                                                            <p className="text-xs text-muted-foreground mb-2">
                                                                {mat.subject} • {mat.grade}
                                                            </p>
                                                            <p className="text-sm font-bold text-primary">KES {mat.price}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <ReviewSection
                                materialId={material.id}
                                reviews={material.reviews.map(r => ({
                                    id: r.id,
                                    rating: r.rating,
                                    comment: r.comment,
                                    reply: r.reply,
                                    repliedAt: r.repliedAt,
                                    createdAt: r.createdAt,
                                    userEmail: maskEmail(r.user.email),
                                    userId: r.userId,
                                }))}
                                averageRating={getAverageRating(material.reviews)}
                                totalReviews={material.reviews.length}
                                hasPurchased={!!hasPurchased}
                                isTeacher={user?.id === material.teacherId}
                                user={user}
                            />
                        </div>

                        {/* Right Column - Purchase Card (Desktop Only) */}
                        <div className="hidden lg:block lg:col-span-1">
                            <div className="sticky top-8">
                                <MaterialDetailClient
                                    material={{
                                        id: material.id,
                                        title: material.title,
                                        price: material.price,
                                        materialType: material.materialType,
                                    }}
                                    hasPurchased={!!hasPurchased}
                                    user={user ? { id: user.id, email: user.email, phone: user.phone, role: user.role } : null}
                                />

                                {/* Related Materials */}
                                {relatedMaterials.length > 0 && (
                                    <div className="mt-6 bg-card border border-border rounded-lg p-6">
                                        <h3 className="text-lg font-bold text-foreground mb-4">Related Materials</h3>
                                        <div className="space-y-3">
                                            {relatedMaterials.map((mat) => {
                                                const config = getMaterialTypeConfig(mat.materialType);
                                                return (
                                                    <Link
                                                        key={mat.id}
                                                        href={`/marketplace/${mat.id}`}
                                                        className="block border border-border rounded-lg p-3 hover:bg-accent transition-colors"
                                                    >
                                                        <div className="flex items-start space-x-2">
                                                            <span className="text-xl">{config.icon}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-foreground text-sm line-clamp-2 mb-1">
                                                                    {mat.title}
                                                                </h4>
                                                                <p className="text-xs text-muted-foreground mb-1">
                                                                    By {mat.teacher.email.split('@')[0]}
                                                                </p>
                                                                <p className="text-sm font-bold text-primary">KES {mat.price}</p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
