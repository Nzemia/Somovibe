import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";

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

        return NextResponse.json(review);
    } catch (error: any) {
        console.error("Review submission error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to submit review" },
            { status: 500 }
        );
    }
}
