"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Review = {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    userEmail: string;
};

type Props = {
    materialId: string;
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
    hasPurchased: boolean;
    user: { id: string; email: string; role: string } | null;
};

export default function ReviewSection({
    materialId,
    reviews,
    averageRating,
    totalReviews,
    hasPurchased,
    user,
}: Props) {
    const router = useRouter();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [hoveredRating, setHoveredRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error("Please login to leave a review");
            router.push("/login");
            return;
        }

        if (!hasPurchased) {
            toast.error("You must purchase this material to leave a review");
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch("/api/review/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pdfId: materialId,
                    rating,
                    comment: comment.trim() || null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to submit review");
            }

            toast.success("Review submitted successfully!");
            setComment("");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (count: number, interactive: boolean = false) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type={interactive ? "button" : undefined}
                        disabled={!interactive}
                        onClick={() => interactive && setRating(star)}
                        onMouseEnter={() => interactive && setHoveredRating(star)}
                        onMouseLeave={() => interactive && setHoveredRating(0)}
                        className={interactive ? "cursor-pointer transition-transform hover:scale-110" : ""}
                    >
                        <svg
                            className={`w-5 h-5 ${star <= (interactive ? (hoveredRating || rating) : count)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600"
                                }`}
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Ratings & Reviews</h2>

            {/* Average Rating */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="text-center">
                    <div className="text-4xl font-bold text-foreground mb-1">
                        {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
                    </div>
                    {renderStars(Math.round(averageRating))}
                    <p className="text-sm text-muted-foreground mt-1">
                        {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                    </p>
                </div>
            </div>

            {/* Review Form */}
            {hasPurchased && user && (
                <form onSubmit={handleSubmit} className="mb-6 pb-6 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Leave a Review</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Your Rating
                            </label>
                            {renderStars(rating, true)}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Your Review (Optional)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience with this material..."
                                rows={4}
                                className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {submitting ? "Submitting..." : "Submit Review"}
                        </button>
                    </div>
                </form>
            )}

            {!hasPurchased && user && (
                <div className="mb-6 pb-6 border-b border-border">
                    <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Purchase this material to leave a review
                        </p>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Recent Reviews</h3>
                {reviews.length === 0 ? (
                    <div className="text-center py-8">
                        <svg
                            className="w-12 h-12 mx-auto text-muted-foreground mb-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                            />
                        </svg>
                        <p className="text-sm text-muted-foreground">No reviews yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Be the first to review this material!
                        </p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="border border-border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        {renderStars(review.rating)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{review.userEmail}</p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                            {review.comment && (
                                <p className="text-sm text-foreground mt-2">{review.comment}</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
