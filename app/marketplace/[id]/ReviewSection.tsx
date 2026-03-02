"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/* ── Types ───────────────────────────────────────────────── */
import type { Review } from "../types";

// component-specific props


type Props = {
  materialId: string;
  initialReviews: Review[];
  isPurchased: boolean;
  user: { id: string; email: string; role: string } | null;
  isTeacher: boolean;
};

/* ── Star Picker (interactive) ───────────────────────────── */
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hov, setHov] = useState(0);
  const labels = ["Terrible", "Poor", "Okay", "Good", "Excellent"];
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            onMouseEnter={() => setHov(s)}
            onMouseLeave={() => setHov(0)}
            className="transition-transform hover:scale-110 active:scale-90 touch-manipulation"
            aria-label={`${s} star`}
          >
            <svg
              className={`w-9 h-9 sm:w-8 sm:h-8 transition-colors ${
                s <= (hov || value)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-gray-200 text-gray-200"
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
      {(hov || value) > 0 && (
        <span className="text-sm font-bold text-[#008c43]">
          {labels[(hov || value) - 1]}
        </span>
      )}
    </div>
  );
}

/* ── Star Display (read-only) ────────────────────────────── */
function Stars({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`${cls} ${
            s <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ── Rating breakdown bar ────────────────────────────────── */
function RatingBar({
  star,
  count,
  total,
}: {
  star: number;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-500 w-3 text-right font-semibold">{star}</span>
      <svg
        className="w-3 h-3 fill-amber-400 shrink-0"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-gray-400 w-5 text-right tabular-nums">{count}</span>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function ReviewSection({
  materialId,
  initialReviews,
  isPurchased,
  user,
  isTeacher,
}: Props) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  /* Sync if server re-renders with fresh data */
  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  const canReview =
    isPurchased && !!user && user.role !== "ADMIN" && !isTeacher;
  const hasUserReview = reviews.some((r) => r.userId === user?.id);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
  const displayedReviews = showAll ? reviews : reviews.slice(0, 4);

  const ratingCounts = useMemo(() => {
    const c: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) c[r.rating]++;
    });
    return c;
  }, [reviews]);

  /* ── Handlers ─────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please log in to leave a review"); return; }
    if (!isPurchased) { toast.error("Purchase this material to leave a review"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/review/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfId: materialId, rating, comment: comment.trim() || null }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to submit review");
      }
      const data = await res.json();
      /* Optimistic add to top of list */
      const newReview: Review = {
        id: data.id,
        rating,
        comment: comment.trim() || null,
        reply: null,
        repliedAt: null,
        createdAt: data.createdAt ?? new Date(),
        userId: user.id,
        user: { name: user.email.split("@")[0], email: user.email },
      };
      setReviews((prev) => [newReview, ...prev]);
      setComment("");
      setRating(5);
      setShowMobileForm(false);
      toast.success("Review submitted!");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    setDeletingId(reviewId);
    try {
      const res = await fetch(`/api/review/delete?reviewId=${reviewId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to delete");
      }
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setConfirmDeleteId(null);
      toast.success("Review deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not delete review");
    } finally {
      setDeletingId(null);
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) { toast.error("Enter a reply"); return; }
    try {
      const res = await fetch("/api/review/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, reply: replyText.trim() }),
      });
      if (!res.ok) throw new Error("Failed to submit reply");
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, reply: replyText.trim(), repliedAt: new Date() }
            : r
        )
      );
      setReplyingTo(null);
      setReplyText("");
      toast.success("Reply submitted!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not submit reply");
    }
  };

  /* ── Rating Summary (shared) ──────────────────────── */
  const RatingSummary = (
    <div className="flex items-start gap-5">
      <div className="text-center shrink-0">
        <div className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-none mb-1.5">
          {reviews.length > 0 ? avgRating.toFixed(1) : "—"}
        </div>
        <Stars value={avgRating} size="md" />
        <p className="text-xs text-gray-400 mt-1.5 tabular-nums">
          {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
        </p>
      </div>
      {reviews.length > 0 && (
        <div className="flex-1 space-y-1.5 pt-1 min-w-0">
          {[5, 4, 3, 2, 1].map((s) => (
            <RatingBar
              key={s}
              star={s}
              count={ratingCounts[s]}
              total={reviews.length}
            />
          ))}
        </div>
      )}
    </div>
  );

  /* ── Submit Form (shared markup) ──────────────────── */
  const SubmitForm = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
          Your Rating
        </p>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Your Review{" "}
          <span className="font-normal normal-case text-gray-300">(optional)</span>
        </p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this material…"
          rows={4}
          className="w-full px-3.5 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008c43]/30 focus:border-[#008c43] resize-none transition-colors placeholder-gray-300"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-60 active:scale-95 shadow-md shadow-[#008c43]/20"
        style={{
          background:
            "linear-gradient(135deg, #006832 0%, #008c43 60%, #00a854 100%)",
        }}
      >
        {submitting ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Submitting…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Submit Review
          </>
        )}
      </button>
    </form>
  );

  /* ── Single review card renderer ─────────────────── */
  const renderReview = (review: Review) => {
    const handle = review.user.name || review.user.email.split("@")[0];
    const isOwn = user?.id === review.userId;
    const isConfirming = confirmDeleteId === review.id;
    const isDeleting = deletingId === review.id;

    return (
      <div key={review.id} className="group">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 uppercase select-none"
            style={{
              background:
                "linear-gradient(135deg, #008c43 0%, #004d25 100%)",
            }}
          >
            {handle[0]}
          </div>

          <div className="flex-1 min-w-0">
            {/* Row: name + stars + date + delete */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">
                  {handle}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Stars value={review.rating} />
                  <span className="text-xs text-gray-400 tabular-nums">
                    {new Date(review.createdAt).toLocaleDateString("en-KE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Delete trigger
                  Mobile  → always visible
                  Desktop → only on group hover */}
              {isOwn && !isConfirming && (
                <button
                  onClick={() => setConfirmDeleteId(review.id)}
                  disabled={isDeleting}
                  aria-label="Delete review"
                  className="shrink-0 p-1.5 rounded-lg transition-colors disabled:opacity-40
                             text-gray-300 hover:text-red-500 hover:bg-red-50
                             sm:opacity-0 sm:group-hover:opacity-100 opacity-100"
                >
                  {isDeleting ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              )}
            </div>

            {/* Comment text */}
            {review.comment && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {review.comment}
              </p>
            )}

            {/* Inline delete confirm (same on both mobile & desktop) */}
            {isOwn && isConfirming && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                <svg
                  className="w-4 h-4 text-red-500 shrink-0"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-xs text-red-600 font-medium flex-1">
                  Delete this review?
                </span>
                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={isDeleting}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg disabled:opacity-60 transition-colors"
                >
                  {isDeleting ? "Deleting…" : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Teacher reply */}
            {review.reply && (
              <div className="mt-2.5 pl-3 ml-1 border-l-2 border-[#d1e8dc]">
                <p className="text-xs font-bold text-[#006832] mb-0.5">
                  Teacher replied
                  {review.repliedAt && (
                    <span className="font-normal text-gray-400 ml-1.5">
                      ·{" "}
                      {new Date(review.repliedAt).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600">{review.reply}</p>
              </div>
            )}

            {/* Reply form — teacher only */}
            {isTeacher && !review.reply && (
              <div className="mt-2">
                {replyingTo === review.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply…"
                      rows={2}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008c43]/30 focus:border-[#008c43] resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReply(review.id)}
                        className="px-3 py-1.5 text-xs font-bold text-white rounded-lg"
                        style={{ background: "linear-gradient(135deg, #006832 0%, #008c43 100%)" }}
                      >
                        Submit Reply
                      </button>
                      <button
                        onClick={() => { setReplyingTo(null); setReplyText(""); }}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingTo(review.id)}
                    className="mt-1 text-xs text-[#008c43] font-semibold hover:underline flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Reply to review
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ── Reviews list section (shared) ───────────────── */
  const ReviewsList = (
    <>
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="w-12 h-12 mx-auto text-gray-200 mb-3"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="text-sm font-semibold text-gray-400">No reviews yet</p>
          <p className="text-xs text-gray-300 mt-1">Be the first to review this material!</p>
        </div>
      ) : (
        <div className="space-y-0 divide-y divide-gray-50">
          {displayedReviews.map((r, i) => (
            <div key={r.id} className={i > 0 ? "pt-4" : ""} style={i > 0 ? { paddingTop: "1rem" } : {}}>
              {renderReview(r)}
            </div>
          ))}
          {reviews.length > 4 && (
            <div className="pt-4 text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-1.5 text-sm text-[#008c43] font-semibold hover:underline"
              >
                {showAll ? "Show fewer reviews" : `Show all ${reviews.length} reviews`}
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${showAll ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );

  /* ── Left panel content (sidebar on desktop) ──────── */
  const LeftPanel = (
    <div className="space-y-5">
      {RatingSummary}

      {/* Already reviewed */}
      {canReview && hasUserReview && (
        <div className="flex items-center gap-2 bg-[#f0faf5] border border-[#d1e8dc] rounded-xl p-3">
          <svg className="w-4 h-4 text-[#008c43] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-xs text-[#006832] font-semibold">
            You've already reviewed this material
          </p>
        </div>
      )}

      {/* Not purchased */}
      {!canReview && !!user && user.role !== "ADMIN" && !isTeacher && !isPurchased && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
          <svg className="w-7 h-7 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-xs text-gray-400 font-medium">
            Purchase this material to leave a review
          </p>
        </div>
      )}

      {/* Desktop form (always visible in left column) */}
      {canReview && !hasUserReview && (
        <div className="hidden lg:block border-t border-gray-100 pt-5">
          <p className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#008c43]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Write a Review
          </p>
          {SubmitForm}
        </div>
      )}
    </div>
  );

  /* ── Render ───────────────────────────────────────── */
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          Ratings & Reviews
          {reviews.length > 0 && (
            <span className="text-sm font-semibold text-gray-400 tabular-nums">
              ({reviews.length})
            </span>
          )}
        </h2>
        {avgRating > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-extrabold text-gray-900 tabular-nums">
              {avgRating.toFixed(1)}
            </span>
            <Stars value={avgRating} />
          </div>
        )}
      </div>

      {/* ── MOBILE layout: stacked ─────────────────── */}
      <div className="lg:hidden p-5 space-y-5">
        {/* Rating summary */}
        {RatingSummary}

        {/* Collapsible write-review for eligible users */}
        {canReview && !hasUserReview && (
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowMobileForm((v) => !v)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-[#f5faf7] hover:bg-[#eef7f2] transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-[#008c43]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Write a Review
              </span>
              <svg
                className={`w-4 h-4 text-[#008c43] transition-transform duration-200 ${showMobileForm ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showMobileForm && (
              <div className="px-4 pt-4 pb-5 border-t border-gray-100">
                {SubmitForm}
              </div>
            )}
          </div>
        )}

        {/* Already reviewed */}
        {canReview && hasUserReview && (
          <div className="flex items-center gap-2 bg-[#f0faf5] border border-[#d1e8dc] rounded-xl p-3">
            <svg className="w-4 h-4 text-[#008c43] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-xs text-[#006832] font-semibold">
              You've already reviewed this material
            </p>
          </div>
        )}

        {/* Not purchased */}
        {!canReview && !!user && user.role !== "ADMIN" && !isTeacher && !isPurchased && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
            <svg className="w-7 h-7 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-xs text-gray-400 font-medium">
              Purchase this material to leave a review
            </p>
          </div>
        )}

        {/* Reviews list */}
        {ReviewsList}
      </div>

      {/* ── DESKTOP layout: 2-column ───────────────── */}
      <div className="hidden lg:flex divide-x divide-gray-100 min-h-[200px]">
        {/* Left: summary + form */}
        <div className="w-72 shrink-0 p-6">
          {LeftPanel}
        </div>
        {/* Right: reviews */}
        <div className="flex-1 p-6 min-w-0">
          {ReviewsList}
        </div>
      </div>
    </div>
  );
}
