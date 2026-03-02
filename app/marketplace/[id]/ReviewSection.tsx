"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Review = {
    id: string;
    rating: number;
    comment: string | null;
    reply: string | null;
    repliedAt: Date | null;
    createdAt: Date;
    userEmail: string;
    userId: string;
};

type Props = {
    materialId: string;
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
    hasPurchased: boolean;
    isTeacher: boolean;
    user: { id: string; email: string; role: string } | null;
};

export default function ReviewSection({
    materialId,
    reviews,
    averageRating,
    totalReviews,
    hasPurchased,
    isTeacher,
    user,
}: Props) {
    const router = useRouter();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [hoveredRating, setHoveredRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [deletingReview, setDeletingReview] = useState<string | null>(null);
    const [showAllReviews, setShowAllReviews] = useState(false);

    const REVIEWS_TO_SHOW = 5;
    const displayedReviews = showAllReviews ? reviews : reviews.slice(0, REVIEWS_TO_SHOW);
    const hasMoreReviews = reviews.length > REVIEWS_TO_SHOW;

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

            if (!res.ok) {
                const data = await res.json().catch(() => ({ error: "Failed to submit review" }));
                throw new Error(data.error || "Failed to submit review");
            }

            toast.success("Review submitted successfully!");
            setComment("");
            router.refresh();
        } catch (err: any) {
            console.error("Submit error:", err);
            toast.error(err.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        try {
            const res = await fetch(`/api/review/delete?reviewId=${reviewId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({ error: "Failed to delete review" }));
                throw new Error(data.error || "Failed to delete review");
            }

            toast.success("Review deleted successfully!");
            setDeletingReview(null);
            router.refresh();
        } catch (err: any) {
            console.error("Delete error:", err);
            toast.error(err.message || "Something went wrong. Please try again.");
        }
    };

    const handleReplySubmit = async (reviewId: string) => {
        if (!replyText.trim()) {
            toast.error("Please enter a reply");
            return;
        }

        try {
            const res = await fetch("/api/review/reply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reviewId,
                    reply: replyText.trim(),
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({ error: "Failed to submit reply" }));
                throw new Error(data.error || "Failed to submit reply");
            }

            toast.success("Reply submitted successfully!");
            setReplyingTo(null);
            setReplyText("");
            router.refresh();
        } catch (err: any) {
            console.error("Reply error:", err);
            toast.error(err.message || "Something went wrong. Please try again.");
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
            {hasPurchased && user && user.role !== "ADMIN" && !isTeacher && (
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

            {!hasPurchased && user && user.role !== "ADMIN" && !isTeacher && (
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
                <h3 className="text-lg font-semibold text-foreground">
                    {totalReviews > 0 ? `All Reviews (${totalReviews})` : "Reviews"}
                </h3>
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
                    <>
                        {displayedReviews.map((review) => (
                            <div key={review.id} className="border border-border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {renderStars(review.rating)}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{review.userEmail}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                        {user && (user.role === "ADMIN" || user.id === review.userId) && (
                                            <AlertDialog open={deletingReview === review.id} onOpenChange={(open) => !open && setDeletingReview(null)}>
                                                <AlertDialogTrigger asChild>
                                                    <button
                                                        onClick={() => setDeletingReview(review.id)}
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                        title="Delete review"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Review</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete this review? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteReview(review.id)}
                                                            className="bg-red-500 hover:bg-red-600"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </div>
                                {review.comment && (
                                    <p className="text-sm text-foreground mt-2">{review.comment}</p>
                                )}

                                {/* Teacher Reply */}
                                {review.reply && (
                                    <div className="mt-3 ml-4 pl-4 border-l-2 border-primary/30 bg-primary/5 p-3 rounded-r-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                            </svg>
                                            <span className="text-xs font-medium text-primary">Teacher's Reply</span>
                                            <span className="text-xs text-muted-foreground">
                                                {review.repliedAt && new Date(review.repliedAt).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-foreground">{review.reply}</p>
                                    </div>
                                )}

                                {/* Reply Form for Teacher */}
                                {isTeacher && !review.reply && (
                                    <div className="mt-3">
                                        {replyingTo === review.id ? (
                                            <div className="space-y-2">
                                                <textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Write your reply..."
                                                    rows={3}
                                                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleReplySubmit(review.id)}
                                                        className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90"
                                                    >
                                                        Submit Reply
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setReplyingTo(null);
                                                            setReplyText("");
                                                        }}
                                                        className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setReplyingTo(review.id)}
                                                className="text-sm text-primary hover:underline flex items-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                </svg>
                                                Reply to this review
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                        }

                        {/* Show More/Less Button */}
                        {hasMoreReviews && (
                            <div className="text-center pt-4">
                                <button
                                    onClick={() => setShowAllReviews(!showAllReviews)}
                                    className="px-6 py-2 text-sm font-medium text-primary hover:text-primary/80 border border-primary/30 rounded-md hover:bg-primary/5 transition-colors"
                                >
                                    {showAllReviews ? (
                                        <>
                                            Show Less
                                            <svg className="w-4 h-4 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                            </svg>
                                        </>
                                    ) : (
                                        <>
                                            Show All {reviews.length} Reviews
                                            <svg className="w-4 h-4 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
