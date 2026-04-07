"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { Loader2, ShieldCheck, Star } from "lucide-react";

function ReviewStars({ rating, size = 16, interactive = false, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const active = starValue <= rating;

        if (interactive) {
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => onChange?.(starValue)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-amber-50"
              aria-label={`Rate ${starValue} star${starValue === 1 ? "" : "s"}`}
            >
              <Star
                size={size}
                strokeWidth={1.8}
                className={active ? "text-amber-400" : "text-amber-300"}
                fill={active ? "currentColor" : "none"}
              />
            </button>
          );
        }

        return (
          <Star
            key={starValue}
            size={size}
            strokeWidth={1.8}
            className={active ? "text-amber-400" : "text-amber-300"}
            fill={active ? "currentColor" : "none"}
          />
        );
      })}
    </div>
  );
}

function formatReviewDate(value) {
  if (!value) return "Recently";

  return new Date(value).toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name) {
  const parts = String(name || "Customer")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "CU";

  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

export default function ProductReviewsPanel({
  productId,
  productName,
  initialReviews = [],
  initialSummary = { rating: 0, reviewCount: 0 },
  initialUserReview = null,
  onSummaryChange,
}) {
  const { status } = useSession();
  const [reviews, setReviews] = useState(initialReviews);
  const [summary, setSummary] = useState(initialSummary);
  const [userReview, setUserReview] = useState(initialUserReview);
  const [form, setForm] = useState({
    rating: initialUserReview?.rating || 5,
    title: initialUserReview?.title || "",
    comment: initialUserReview?.comment || "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews, productId]);

  useEffect(() => {
    setSummary(initialSummary);
  }, [initialSummary, productId]);

  useEffect(() => {
    setUserReview(initialUserReview);
    setForm({
      rating: initialUserReview?.rating || 5,
      title: initialUserReview?.title || "",
      comment: initialUserReview?.comment || "",
    });
    setMessage("");
    setError("");
  }, [initialUserReview, productId]);

  const averageRatingLabel = useMemo(() => {
    if (!summary?.reviewCount) return "No reviews yet";

    return `${summary.rating.toFixed(1)} average from ${summary.reviewCount} review${summary.reviewCount === 1 ? "" : "s"}`;
  }, [summary]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/products/${encodeURIComponent(productId)}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to submit review.");
      }

      const nextUserReview = data.userReview || null;
      setReviews(data.reviews || []);
      setSummary(data.summary || { rating: 0, reviewCount: 0 });
      setUserReview(nextUserReview);
      setForm({
        rating: nextUserReview?.rating || form.rating,
        title: nextUserReview?.title || "",
        comment: nextUserReview?.comment || "",
      });
      setMessage(userReview ? "Your review has been updated." : "Your review has been submitted.");
      onSummaryChange?.(data.summary || { rating: 0, reviewCount: 0 });
    } catch (submitError) {
      setError(submitError.message || "Unable to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[24px] font-semibold text-ink-900">
                {summary?.reviewCount ? summary.rating.toFixed(1) : "0.0"}
              </p>
              <p className="mt-1 text-sm text-ink-500">{averageRatingLabel}</p>
            </div>
            <ReviewStars rating={Math.round(summary?.rating || 0)} size={18} />
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {review.userImage ? (
                      <img
                        src={review.userImage}
                        alt={review.userName}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                        {getInitials(review.userName)}
                      </div>
                    )}

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-ink-900">{review.userName}</p>
                        {review.verifiedPurchase ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                            <ShieldCheck size={12} />
                            Verified Purchase
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-ink-400">{formatReviewDate(review.updatedAt || review.createdAt)}</p>
                    </div>
                  </div>

                  <ReviewStars rating={review.rating} size={15} />
                </div>

                {review.title ? (
                  <h4 className="mt-4 text-[15px] font-semibold text-ink-900">{review.title}</h4>
                ) : null}
                <p className="mt-2 text-sm leading-6 text-ink-600">{review.comment}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[22px] border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-ink-500">
            No customer reviews yet. Be the first one to share your experience with {productName}.
          </div>
        )}
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
        <h3 className="text-[18px] font-semibold text-ink-900">
          {userReview ? "Update Your Review" : "Write a Review"}
        </h3>
        <p className="mt-1 text-sm leading-6 text-ink-500">
          Share your experience with this product. One account can keep one review updated.
        </p>

        {status === "loading" ? (
          <div className="mt-4 rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-ink-500">
            Checking your account so we can prepare the review form.
          </div>
        ) : status === "authenticated" ? (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-ink-700">Your rating</label>
              <div className="mt-2">
                <ReviewStars
                  rating={form.rating}
                  size={18}
                  interactive
                  onChange={(rating) => setForm((current) => ({ ...current, rating }))}
                />
              </div>
            </div>

            <div>
              <label htmlFor="review-title" className="text-sm font-medium text-ink-700">
                Review title
              </label>
              <input
                id="review-title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Short headline for your review"
                className="mt-2 h-11 w-full rounded-[12px] border border-slate-200 px-3 text-sm text-ink-700 outline-none transition-colors focus:border-slate-400"
                maxLength={80}
              />
            </div>

            <div>
              <label htmlFor="review-comment" className="text-sm font-medium text-ink-700">
                Review comment
              </label>
              <textarea
                id="review-comment"
                value={form.comment}
                onChange={(event) =>
                  setForm((current) => ({ ...current, comment: event.target.value }))
                }
                placeholder="Tell other customers what you liked, how delivery felt, and how the product performed."
                className="mt-2 min-h-[132px] w-full rounded-[12px] border border-slate-200 px-3 py-3 text-sm leading-6 text-ink-700 outline-none transition-colors focus:border-slate-400"
                maxLength={600}
              />
              <p className="mt-1 text-xs text-ink-400">{form.comment.length}/600</p>
            </div>

            {error ? (
              <p className="rounded-[12px] bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
            ) : null}
            {message ? (
              <p className="rounded-[12px] bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              <span>{userReview ? "Update review" : "Submit review"}</span>
            </button>
          </form>
        ) : (
          <div className="mt-4 rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
            <p className="text-sm leading-6 text-ink-600">
              Please log in first to share a review for this product.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-[12px] bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              Log in to review
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
