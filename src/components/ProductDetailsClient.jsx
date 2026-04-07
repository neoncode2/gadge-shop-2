"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BatteryCharging,
  Headphones,
  Minus,
  Package,
  PlugZap,
  Plus,
  ShoppingCart,
  Smartphone,
  Star,
  Watch,
} from "lucide-react";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/format";
import ProductReviewsPanel from "./ProductReviewsPanel";
import WishlistButton from "./WishlistButton";

function Stars({ rating = 0, count = 0, compact = false }) {
  return (
    <div className={`flex items-center ${compact ? "gap-0.5" : "gap-1.5"}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={compact ? 11 : 13}
            strokeWidth={1.8}
            className={index < rating ? "text-amber-400" : "text-amber-300"}
            fill={index < rating ? "currentColor" : "none"}
          />
        ))}
      </div>
      <span className="text-xs text-ink-400">({count} reviews)</span>
    </div>
  );
}

export default function ProductDetailsClient({ product, related }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedSize, setSelectedSize] = useState(product.strapSizes?.[0] || "Standard");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "Default");
  const [reviewSummary, setReviewSummary] = useState({
    rating: Number(product.reviewSummary?.rating ?? product.rating ?? 0),
    reviewCount: Number(product.reviewSummary?.reviewCount ?? product.reviewCount ?? 0),
  });

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const discountTag = product.tag || (discount > 0 ? `-${discount}% OFF` : null);
  const rating = Number(reviewSummary.rating || product.rating || 0);
  const reviewCount = Number(reviewSummary.reviewCount || product.reviewCount || 0);

  const gallery = useMemo(() => {
    const toGalleryItem = (item, index) => {
      if (typeof item === "string") {
        return {
          src: item,
          label: `View ${index + 1}`,
          imageClass: "",
        };
      }

      return {
        src: item?.src || item?.image || product.image,
        label: item?.label || `View ${index + 1}`,
        imageClass: item?.imageClass || "",
      };
    };

    const incoming =
      (Array.isArray(product.gallery) && product.gallery.length > 0 && product.gallery) ||
      (Array.isArray(product.images) && product.images.length > 0 && product.images) ||
      null;

    if (incoming) {
      return incoming.map(toGalleryItem).filter((item) => Boolean(item.src));
    }

    return [
      { src: product.image, label: "Front View", imageClass: "" },
      { src: product.image, label: "Left Angle", imageClass: "-rotate-6 scale-[0.97]" },
      { src: product.image, label: "Right Angle", imageClass: "rotate-6 scale-[0.97]" },
    ].filter((item) => Boolean(item.src));
  }, [product]);

  useEffect(() => {
    setActiveImageIndex(0);
    setActiveTab("description");
    setQty(1);
    setSelectedSize(product.strapSizes?.[0] || "Standard");
    setSelectedColor(product.colors?.[0] || "Default");
  }, [product.id]);

  useEffect(() => {
    setReviewSummary({
      rating: Number(product.reviewSummary?.rating ?? product.rating ?? 0),
      reviewCount: Number(product.reviewSummary?.reviewCount ?? product.reviewCount ?? 0),
    });
  }, [product.id, product.rating, product.reviewCount, product.reviewSummary]);

  const activeImage = gallery[activeImageIndex] || gallery[0];
  const strapSizes = product.strapSizes || ["SM", "ML"];
  const colors = product.colors || ["Rose Gold", "Space Gray", "Jet Black"];
  const relatedProducts = Array.isArray(related) ? related.slice(0, 2) : [];
  const categoryIcons = {
    Phones: Smartphone,
    Watches: Watch,
    "Power Bank": BatteryCharging,
    "Speaker & Headphone": Headphones,
    "Charger & Adapter": PlugZap,
  };
  const categories = (product.categories || [product.category]).map((name) => ({
    name,
    icon: categoryIcons[name] || Package,
  }));
  const descriptionPoints = product.descriptionPoints || [];
  const specs = product.specs || [];
  const productTags = (product.sections || []).join(", ") || product.tag || "Featured";

  return (
    <div className="grid grid-cols-1 gap-5 pb-6 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="space-y-5">
        <section className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-3 sm:p-4 lg:grid-cols-[1.04fr_0.96fr]">
          <div>
            <div className="relative rounded-lg border border-slate-200 bg-[#fbfbfc] p-4 sm:p-5">
              {discountTag && (
                <span className="product-card-accent-badge absolute left-2 top-2 rounded px-2 py-1 text-[10px] font-semibold">
                  {discountTag}
                </span>
              )}
              <WishlistButton
                product={product}
                buttonClassName="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-white"
                activeIconClassName="text-rose-500"
                inactiveIconClassName="product-card-accent-icon"
                iconSize={15}
              />
              <div className="flex h-[210px] items-center justify-center sm:h-[250px]">
                {activeImage?.src && (
                  <Image
                    src={activeImage.src}
                    alt={`${product.name} - ${activeImage.label}`}
                    width={330}
                    height={300}
                    className={`h-auto w-full max-w-[300px] object-contain transition-transform duration-300 ${activeImage.imageClass}`}
                    sizes="(max-width: 640px) 260px, 300px"
                  />
                )}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {gallery.map((item, index) => (
                <button
                  key={`${item.src}-${item.label}-${index}`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`Select ${item.label}`}
                  className={`flex h-12 w-12 items-center justify-center rounded-[10px] border bg-white p-1 transition-all ${
                    activeImageIndex === index
                      ? "border-[#8a7df0] shadow-[0_0_0_2px_rgba(138,125,240,0.15)]"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {item.src && (
                    <Image
                      src={item.src}
                      alt={item.label}
                      width={44}
                      height={44}
                      className={`h-auto w-auto max-h-[38px] max-w-[38px] object-contain ${item.imageClass}`}
                      sizes="38px"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h1 className="text-[28px] font-semibold leading-[1.25] text-ink-900">
              {product.name}
            </h1>
            <div className="mt-1">
              <Stars rating={Math.round(rating)} count={reviewCount} />
            </div>
            <div className="mt-2 flex items-end gap-2.5">
              <span className="text-[44px] font-semibold leading-none text-ink-900">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="pb-1 text-lg text-ink-400 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            <div className="mt-5 flex items-center gap-3">
              <span className="text-xs font-medium text-ink-500">Strap Size:</span>
              <div className="flex gap-2">
                {strapSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded border px-2 py-0.5 text-xs ${
                      selectedSize === size
                        ? "border-slate-400 bg-slate-50 text-ink-800"
                        : "border-slate-200 text-ink-500"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-ink-500">Color:</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`rounded border px-2.5 py-1 text-xs transition-colors ${
                      selectedColor === color
                        ? "border-slate-400 bg-slate-50 text-ink-800"
                        : "border-slate-200 text-ink-500 hover:border-slate-300"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <div className="flex items-center rounded border border-slate-300">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  className="flex h-8 w-8 items-center justify-center text-ink-700"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus size={13} />
                </button>
                <span className="w-8 text-center text-sm font-medium text-ink-700">{qty}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  className="flex h-8 w-8 items-center justify-center text-ink-700"
                  onClick={() => setQty((q) => q + 1)}
                >
                  <Plus size={13} />
                </button>
              </div>

              <button
                onClick={() => router.push(`/checkout?product=${encodeURIComponent(product.id)}`)}
                className="product-card-accent-fill inline-flex h-8 items-center gap-1.5 rounded px-3 text-xs font-medium transition-colors"
              >
                <ShoppingCart size={13} />
                <span>অর্ডার করুন</span>
              </button>
              <button
                onClick={() => addItem(product, qty)}
                className="product-card-accent-outline inline-flex h-8 items-center gap-1.5 rounded border px-3 text-xs font-medium transition-colors"
              >
                <ShoppingCart size={13} />
                <span>কার্টে যুক্ত করুন</span>
              </button>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-ink-500">
              <p>
                Category: <span className="text-ink-600">{product.category}</span>
              </p>
              <p>
                Brand: <span className="text-ink-600">{product.brand}</span>
              </p>
              <p>
                Tag: <span className="text-ink-600">{productTags}</span>
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => setActiveTab("description")}
              className={`rounded-full px-4 py-1.5 font-semibold transition-colors ${
                activeTab === "description"
                  ? "border border-slate-300 bg-white text-ink-800"
                  : "border border-slate-200 bg-white text-ink-500"
              }`}
            >
              Description
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`rounded-full px-4 py-1.5 transition-colors ${
                activeTab === "reviews"
                  ? "border border-slate-300 bg-white font-semibold text-ink-800"
                  : "border border-slate-200 bg-white text-ink-500"
              }`}
            >
              Reviews({reviewCount})
            </button>
          </div>
          {activeTab === "description" ? (
            <>
              <ul className="mt-5 list-disc space-y-2 pl-4 text-sm text-ink-700">
                {descriptionPoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white text-sm">
                <div className="bg-orange-50 px-3 py-2 font-semibold text-orange-600">Basic Information</div>
                <div className="divide-y divide-slate-200">
                  {specs.map((spec) => (
                    <div key={spec.label} className="grid grid-cols-[88px_1fr] gap-3 px-3 py-2.5">
                      <span className="text-ink-500">{spec.label}</span>
                      <span className="text-ink-700">{spec.value}</span>
                    </div>
                  ))}
                </div>
                <button className="block w-full py-2 text-center text-xs font-semibold text-brand-700">
                  See More
                </button>
              </div>
            </>
          ) : (
            <ProductReviewsPanel
              productId={product.id}
              productName={product.name}
              initialReviews={product.reviews || []}
              initialSummary={reviewSummary}
              initialUserReview={product.userReview || null}
              onSummaryChange={setReviewSummary}
            />
          )}
        </section>
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <h3 className="border-b border-slate-200 pb-2 text-2xl font-semibold text-ink-900">Related Products</h3>
          <div className="mt-3 space-y-3">
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.id}`}
                className="product-card-accent-hover flex gap-2.5 rounded-[10px] border border-slate-200 p-2.5 transition-colors"
              >
                <div className="flex h-[54px] w-[54px] flex-none items-center justify-center rounded-md border border-slate-200 bg-white">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="h-auto w-auto max-h-[44px] max-w-[44px] object-contain"
                    sizes="44px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-[11px] font-semibold leading-[1.35] text-ink-800">
                    {item.name}
                  </p>
                  <p className="product-card-accent-text mt-1 text-[13px] font-semibold">{formatPrice(item.price)}</p>
                  <div className="mt-0.5">
                    <Stars
                      rating={Math.round(Number(item.rating) || 0)}
                      count={Number(item.reviewCount || 0)}
                      compact
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <h3 className="border-b border-slate-200 pb-2 text-2xl font-semibold text-ink-900">Category</h3>
          <ul className="mt-2">
            {categories.map((item) => {
              const Icon = item.icon || Package;

              return (
                <li key={item.name} className="border-b border-slate-100 py-2.5 last:border-b-0">
                  <p className="flex items-center gap-2 text-xs font-medium text-ink-600">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-slate-50">
                      <Icon size={13} />
                    </span>
                    {item.name}
                  </p>
                </li>
              );
            })}
            {categories.length === 0 && (
              <li className="py-2.5">
                <p className="flex items-center gap-2 text-xs font-medium text-ink-600">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-slate-50">
                    <Package size={13} />
                  </span>
                  No categories
                </p>
              </li>
            )}
          </ul>
        </div>
      </aside>
    </div>
  );
}
