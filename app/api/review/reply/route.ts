import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";

export async function POST(req: Request) {
    try {
        const user = await requireAuth();
        const { reviewId, reply } = await req.json();

        if (!reviewId || !reply) {
            return NextResponse.json(
                { error: "Review ID and reply are required" },
                { status: 400 }
            );
        }

        // Get the review and check if user is the material owner
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            include: {
                pdf: {
                    select: {
                        teacherId: true,
                    },
                },
            },
        });

        if (!review) {
            return NextResponse.json(
                { error: "Review not found" },
                { status: 404 }
            );
        }

        // Only the teacher who owns the material can reply
        if (review.pdf.teacherId !== user.id) {
            return NextResponse.json(
                { error: "Only the material owner can reply to reviews" },
                { status: 403 }
            );
        }

        // Update review with reply
        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: {
                reply: reply.trim(),
                repliedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true, review: updatedReview });
    } catch (error: any) {
        console.error("Review reply error:", error);

        // User-friendly error messages
        let errorMessage = "Unable to submit reply. Please try again.";

        if (error.code === "P2025") {
            errorMessage = "Review not found";
        } else if (error.message?.includes("Unknown argument")) {
            errorMessage = "Sorry, something went wrong. Please try again later";
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
