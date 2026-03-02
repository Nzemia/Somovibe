import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { notFound } from "next/navigation";
import MaterialDetailClient from "./MaterialDetailClient";
import ReviewSection from "./ReviewSection";
import { Metadata } from "next";
import { getAverageRating, maskEmail } from "@/lib/utils";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;

    const material = await prisma.pdf.findUnique({
        where: { id, status: "APPROVED" },
        select: {
            title: true,
            description: true,
            thumbnailUrl: true,
            price: true,
            subject: true,
            grade: true,
        },
    });

    if (!material) {
        return {
            title: "Material Not Found",
        };
    }

    return {
        title: `${material.title} - ${material.subject} ${material.grade}`,
        description: material.description,
        openGraph: {
            title: material.title,
            description: material.description,
            images: material.thumbnailUrl ? [material.thumbnailUrl] : [],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: material.title,
            description: material.description,
            images: material.thumbnailUrl ? [material.thumbnailUrl] : [],
        },
    };
}

export default async function MaterialDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const user = await getCurrentUser();

    const material = await prisma.pdf.findUnique({
        where: { id, status: "APPROVED" },
        include: {
            teacher: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    teacherProfile: {
                        select: {
                            isActive: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    downloads: true,
                    reviews: true,
                    purchases: true,
                },
            },
            reviews: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
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
    const purchase = user
        ? await prisma.purchase.findUnique({
            where: {
                userId_pdfId: {
                    userId: user.id,
                    pdfId: material.id,
                },
            },
        })
        : null;

    return (
        <>
            <Navbar user={user ? { email: user.email, role: user.role } : null} />
            <MaterialDetailClient
                material={material}
                isPurchased={!!purchase}
                user={user}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <ReviewSection
                    materialId={material.id}
                    reviews={material.reviews.map((r: any) => ({
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
                    totalReviews={material._count.reviews}
                    hasPurchased={!!purchase}
                    isTeacher={user?.id === material.teacherId}
                    user={user}
                />
            </div>
        </>
    );
}
