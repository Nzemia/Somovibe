import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";

export async function DELETE(req: Request) {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(req.url);
        const reviewId = searchParams.get("reviewId");

        if (!reviewId) {
            return NextResponse.json(
                { error: "Review ID is required" },
                { status: 400 }
            );
        }

        // Check if user is admin or the review owner
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            return NextResponse.json(
                { error: "Review not found" },
                { status: 404 }
            );
        }

        if (user.role !== "ADMIN" && review.userId !== user.id) {
            return NextResponse.json(
                { error: "You don't have permission to delete this review" },
                { status: 403 }
            );
        }

        await prisma.review.delete({
            where: { id: reviewId },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Review deletion error:", error);

        // User-friendly error messages
        let errorMessage = "Unable to delete review. Please try again.";

        if (error.code === "P2025") {
            errorMessage = "Review not found";
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
