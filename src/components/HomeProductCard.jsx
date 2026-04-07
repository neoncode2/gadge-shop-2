"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useCart } from "./CartProvider";
import WishlistButton from "./WishlistButton";

export default function HomeProductCard({ product, compact = false }) {
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
      className={`group relative flex h-full flex-col rounded-[10px] border border-[#ececec] bg-white p-4 text-center shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)] ${
        compact ? "p-3.5" : ""
      }`}
    >
      {discount > 0 && (
        <span
          className={`product-card-accent-badge absolute left-2 top-2 z-[1] rounded-full font-semibold ${
            compact ? "px-2.5 py-1 text-[9px]" : "px-3 py-1 text-[10px]"
          }`}
        >
          -{discount}%
        </span>
      )}

      <WishlistButton
        product={product}
        buttonClassName={`absolute right-2 top-2 z-[1] flex items-center justify-center rounded-full border border-[#ededed] bg-white ${
          compact ? "h-8 w-8" : "h-9 w-9"
        }`}
        iconSize={compact ? 17 : 19}
      />

      <Link href={`/product/${product.id}`} className="block">
        <div
          className={`flex items-center justify-center ${
            compact ? "min-h-[116px] pt-8" : "min-h-[148px] pt-8"
          }`}
        >
          <Image
            src={product.image}
            alt={product.name}
            width={200}
            height={200}
            className={`h-auto w-full object-contain transition-transform duration-200 group-hover:scale-105 ${
              compact ? "max-w-[104px]" : "max-w-[128px]"
            }`}
            sizes={compact ? "104px" : "128px"}
          />
        </div>
        <h3
          className={`mx-auto mt-2 font-medium text-[#555555] ${
            compact
              ? "min-h-[38px] max-w-[160px] text-[12px] leading-[1.4]"
              : "min-h-[44px] max-w-[180px] text-[13px] leading-[1.45] md:text-[14px]"
          }`}
        >
          {product.name}
        </h3>
      </Link>

      <div className="mt-auto pt-4">
        <div className="flex min-h-[42px] flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span className="text-[15px] font-semibold text-[#444444] md:text-[16px]">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-[11px] text-[#9b9b9b] line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] md:text-[11px]">
          <button
            onClick={handleOrderNow}
            className="product-card-accent-fill inline-flex h-9 items-center justify-center rounded-[6px] px-2 font-semibold uppercase tracking-[0.04em] transition-colors"
          >
            Order Now
          </button>
          <button
            onClick={() => addItem(product, 1)}
            className="product-card-accent-outline inline-flex h-9 items-center justify-center gap-1 rounded-[6px] border px-2 font-semibold uppercase tracking-[0.04em] transition-colors"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart size={13} strokeWidth={2} />
            Cart
          </button>
        </div>
      </div>
    </div>
  );
}
