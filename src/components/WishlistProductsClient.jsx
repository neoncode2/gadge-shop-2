"use client";

import Link from "next/link";
import ProductCard from "./ProductCard";
import { useWishlist } from "./WishlistProvider";

export default function WishlistProductsClient({ initialItems = [] }) {
  const { initialized, isAuthenticated, items } = useWishlist();
  const displayItems =
    initialized && isAuthenticated ? items : initialItems;

  if (displayItems.length === 0) {
    return (
      <div className="rounded-[16px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <h3 className="text-xl font-semibold text-ink-900">Your wishlist is empty</h3>
        <p className="mt-2 text-sm text-ink-500">
          Save your favourite products here so you can find them quickly later.
        </p>
        <Link
          href="/products"
          className="mt-5 inline-flex items-center justify-center rounded-md bg-black px-5 py-3 text-sm font-semibold text-white"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-500">
          {displayItems.length} saved product{displayItems.length === 1 ? "" : "s"}
        </p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-ink-700"
        >
          Add more
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {displayItems.map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}
      </div>
    </div>
  );
}
