"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Star } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useCart } from "./CartProvider";
import WishlistButton from "./WishlistButton";

function Stars({ rating, count = 0, compact = false }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={compact ? 12 : 14}
          strokeWidth={1.8}
          className={index < rating ? "text-amber-400" : "text-amber-300"}
          fill={index < rating ? "currentColor" : "none"}
        />
      ))}
      <span className={compact ? "text-[11px] text-ink-500" : "text-xs text-ink-500"}>
        ({count})
      </span>
    </div>
  );
}

export default function ProductCard({ product, compact = false }) {
  const router = useRouter();
  const { addItem } = useCart();
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const handleOrderNow = () => {
    router.push(`/checkout?product=${encodeURIComponent(product.id)}`);
  };

  return (
    <div
      className={`group relative flex flex-col border border-gray-200 bg-white transition-shadow duration-200 ${
        compact
          ? "rounded-[12px] p-3 shadow-[0_4px_14px_rgba(15,23,42,0.05)]"
          : "rounded-lg p-4 shadow-sm hover:shadow-lg"
      }`}
    >
      {discount > 0 && (
        <span
          className={`product-card-accent-badge absolute left-0 top-0 font-semibold ${
            compact
              ? "rounded-br-md rounded-tl-md px-2.5 py-1 text-[10px]"
              : "rounded-br-lg rounded-tl-lg px-3 py-1 text-xs"
          }`}
        >
          -{discount}% OFF
        </span>
      )}
      <WishlistButton
        product={product}
        buttonClassName={`absolute flex items-center justify-center rounded-full border-none ${
          compact ? "right-2.5 top-2.5 h-7 w-7 bg-transparent" : "right-3 top-3 h-9 w-9 bg-white"
        }`}
        iconSize={compact ? 16 : 18}
      />
      <Link href={`/product/${product.id}`} className="block">
        <div
          className={`flex items-center justify-center ${
            compact ? "min-h-[144px] pt-5" : "min-h-[182px] pt-6"
          }`}
        >
          <Image
            src={product.image}
            alt={product.name}
            width={200}
            height={200}
            className={`h-auto w-full object-contain transition-transform duration-200 group-hover:scale-105 ${
              compact ? "max-w-[132px]" : "max-w-[190px]"
            }`}
            sizes={compact ? "132px" : "190px"}
          />
        </div>
        <h3
          className={`font-semibold text-ink-900 ${
            compact ? "mt-3 min-h-[42px] text-[13px] leading-[1.35]" : "mt-4 min-h-[48px] text-[15px] leading-6"
          }`}
        >
          {product.name}
        </h3>
      </Link>
      <div className={compact ? "mt-2" : "mt-3"}>
        <Stars
          rating={Math.round(Number(product.rating) || 0)}
          count={Number(product.reviewCount || 0)}
          compact={compact}
        />
      </div>
      <div className={`flex items-end justify-between ${compact ? "mt-2.5 gap-2.5" : "mt-4 gap-3"}`}>
        <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
          <span className={compact ? "text-[14px] font-bold text-ink-900" : "text-[15px] font-bold text-ink-900"}>
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className={compact ? "text-[10px] text-ink-400 line-through" : "text-xs text-ink-400 line-through"}>
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>
        <button
          onClick={() => addItem(product, 1)}
          className={`product-card-accent-outline inline-flex shrink-0 items-center gap-1 rounded-md border font-medium transition-colors ${
            compact ? "h-7 px-2.5 text-[11px]" : "h-10 px-3 text-sm"
          }`}
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingCart size={compact ? 11 : 14} strokeWidth={2} />
          <span>কার্ট</span>
        </button>
      </div>
      <button
        onClick={handleOrderNow}
        className={`product-card-accent-fill block w-full rounded-md text-center font-semibold transition-colors ${
          compact ? "mt-2.5 px-3 py-2 text-[11px]" : "mt-4 px-4 py-3 text-sm"
        }`}
      >
        অর্ডার করুন
      </button>
    </div>
  );
}
