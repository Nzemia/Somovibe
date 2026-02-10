import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { sendNewReviewNotificationEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const user = await requireAuth();
        const { pdfId, rating, comment } = await req.json();

        if (!pdfId || !rating) {
            return NextResponse.json(
                { error: "PDF ID and rating are required" },
                { status: 400 }
            );
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "Rating must be between 1 and 5" },
                { status: 400 }
            );
        }

        // Check if user has purchased the material
        const purchase = await prisma.purchase.findUnique({
            where: {
                userId_pdfId: {
                    userId: user.id,
                    pdfId,
                },
            },
        });

        if (!purchase) {
            return NextResponse.json(
                { error: "You must purchase this material to leave a review" },
                { status: 403 }
            );
        }

        // Check if user already reviewed this material
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_pdfId: {
                    userId: user.id,
                    pdfId,
                },
            },
        });

        if (existingReview) {
            // Update existing review
            const updatedReview = await prisma.review.update({
                where: {
                    userId_pdfId: {
                        userId: user.id,
                        pdfId,
                    },
                },
                data: {
                    rating,
                    comment: comment || null,
                },
            });

            return NextResponse.json(updatedReview);
        }

        // Create new review
        const review = await prisma.review.create({
            data: {
                userId: user.id,
                pdfId,
                rating,
                comment: comment || null,
            },
        });

        // Send email notification to teacher
        try {
            const material = await prisma.pdf.findUnique({
                where: { id: pdfId },
                include: {
                    teacher: {
                        select: {
                            email: true,
                        },
                    },
                },
            });

            if (material) {
                await sendNewReviewNotificationEmail(
                    material.teacher.email,
                    material.title,
                    rating,
                    user.email,
                    comment || null,
                    pdfId
                );
            }
        } catch (emailError) {
            console.error("Failed to send review notification email:", emailError);
            // Don't fail the request if email fails
        }

        return NextResponse.json(review);
    } catch (error: any) {
        console.error("Review submission error:", error);

        // User-friendly error messages
        let errorMessage = "Unable to submit review. Please try again.";

        if (error.code === "P2002") {
            errorMessage = "You've already reviewed this material";
        } else if (error.code === "P2025") {
            errorMessage = "Material not found";
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
