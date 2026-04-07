import Image from "next/image";
import Link from "next/link";
import { MessageSquareText, ShieldCheck, Star } from "lucide-react";
import { formatPrice } from "@/lib/format";

function formatReviewDate(value) {
  if (!value) return "Recently updated";

  return new Date(value).toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function truncateText(text, maxLength) {
  const normalized = String(text || "").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
}

function ReviewStars({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const active = index < Number(rating || 0);

        return (
          <Star
            key={index}
            size={14}
            strokeWidth={1.8}
            className={active ? "text-amber-400" : "text-amber-300"}
            fill={active ? "currentColor" : "none"}
          />
        );
      })}
    </div>
  );
}

export default function AccountReviewsList({
  reviews = [],
  compact = false,
  emptyTitle = "You have not reviewed any product yet.",
  emptyDescription = "When you review a product, it will appear here.",
}) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-[12px] border border-dashed border-[#d8d8d8] bg-[#fafafa] px-4 py-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#7b7b7b] shadow-[0_4px_16px_rgba(15,23,42,0.06)]">
          <MessageSquareText size={20} />
        </div>
        <p className="mt-4 text-[15px] font-semibold text-[#111111]">{emptyTitle}</p>
        <p className="mt-1 text-[13px] leading-6 text-[#666666]">{emptyDescription}</p>
        <Link
          href="/products"
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-[8px] border border-[#979797] px-4 text-[12px] font-semibold text-[#111111] transition-colors hover:bg-[#f7f7f7]"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className={compact ? "mt-4 space-y-3" : "space-y-4"}>
      {reviews.map((review) => {
        const product = review.product;
        const productHref = product ? `/product/${product.id}` : "/products";
        const comment = compact ? truncateText(review.comment, 145) : review.comment;

        return (
          <article
            key={review.id}
            className={`rounded-[14px] border border-[#eeeeee] bg-white transition-shadow hover:shadow-[0_8px_22px_rgba(15,23,42,0.07)] ${
              compact ? "p-3" : "p-4"
            }`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <Link
                href={productHref}
                className="flex min-w-0 items-center gap-3 rounded-[10px] bg-[#fafafa] p-2 transition-colors hover:bg-[#f5f5f5] sm:w-[240px]"
              >
                <div className="relative h-[56px] w-[56px] shrink-0 overflow-hidden rounded-[10px] bg-white">
                  {product?.image ? (
                    <Image
                      src={product.image}
                      alt={product.name || "Reviewed product"}
                      fill
                      className="object-contain p-1.5"
                      sizes="56px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[11px] font-medium text-[#888888]">
                      N/A
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-[#111111]">
                    {product?.name || "Product unavailable"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#666666]">
                    {product?.brand || product?.category || "Reviewed product"}
                  </p>
                  {product?.price ? (
                    <p className="mt-1 text-[12px] font-semibold text-[#111111]">
                      {formatPrice(product.price)}
                    </p>
                  ) : null}
                </div>
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <ReviewStars rating={review.rating} />
                      {review.verifiedPurchase ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                          <ShieldCheck size={12} />
                          Verified Purchase
                        </span>
                      ) : null}
                    </div>
                    {review.title ? (
                      <h3 className="mt-2 text-[14px] font-semibold text-[#111111]">{review.title}</h3>
                    ) : null}
                    <p className="mt-1 text-[11px] text-[#777777]">
                      Updated {formatReviewDate(review.updatedAt || review.createdAt)}
                    </p>
                  </div>

                  <Link
                    href={productHref}
                    className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-[8px] border border-[#979797] px-3 text-[12px] font-semibold text-[#111111] transition-colors hover:bg-[#f7f7f7]"
                  >
                    View product
                  </Link>
                </div>

                <p className="mt-3 text-[13px] leading-6 text-[#555555]">{comment}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
