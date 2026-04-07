"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingBag, ShoppingCart, Trash2, User } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

function getCartMeta(item) {
  const strapSize = Array.isArray(item?.strapSizes) ? item.strapSizes[0] : item?.strapSize;
  const color = Array.isArray(item?.colors) ? item.colors[0] : item?.color;

  const parts = [
    strapSize ? `Strap Size: ${strapSize}` : null,
    color ? `Color: ${color}` : null,
    !strapSize && !color ? item?.brand || item?.category || "" : null,
  ].filter(Boolean);

  return parts.join(", ");
}

export default function DesktopHeaderBar({
  accountHref,
  count,
  isAuthenticated,
  onSearchChange,
  onSearchSubmit,
  searchValue,
}) {
  const { items, removeItem, subtotal } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const previewItems = useMemo(() => items.slice(0, 2), [items]);
  const hiddenItemsCount = Math.max(0, items.length - previewItems.length);

  return (
    <>
      <Link href="/" className="flex shrink-0 items-center gap-2">
        <Image
          src="/images/logo-1025b.webp"
          alt="GADGETSHOB"
          width={128}
          height={38}
          className="h-auto w-auto"
          style={{ width: "auto", height: "auto" }}
          priority
        />
      </Link>

      <div className="mx-auto w-full max-w-[620px] flex-1">
        <form
          onSubmit={onSearchSubmit}
          className="flex h-10 items-center overflow-hidden rounded-full border border-[#d7d7d7] bg-white pl-4 pr-1.5 shadow-[0_1px_1px_rgba(0,0,0,0.08)]"
        >
          <input
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search products..."
            className="flex-1 bg-transparent text-[13px] text-[#4b4b4b] outline-none"
          />
          <button
            type="submit"
            aria-label="Search products"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f58a1f] text-white"
          >
            <Search size={16} />
          </button>
        </form>
      </div>

      <div className="flex shrink-0 items-center gap-6">
        <div
          className="relative"
          onMouseEnter={() => setIsCartOpen(true)}
          onMouseLeave={() => setIsCartOpen(false)}
        >
          <Link href="/cart" className="relative flex items-center gap-2 text-white">
            <span className="relative text-[#f58a1f]">
              <ShoppingCart size={20} strokeWidth={2.1} />
              <span className="absolute -right-2 -top-2 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#f58a1f] px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            </span>
            <span className="leading-none">
              <span className="block text-[12px] font-semibold text-[#f3f3f3]">Cart</span>
              <span className="mt-0.5 block text-[10px] text-[#bfbfbf]">Add items</span>
            </span>
          </Link>

          <AnimatePresence>
            {isCartOpen && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.985 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 top-full z-[160] mt-4 w-[320px] overflow-hidden rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
              >
                {previewItems.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {previewItems.map((item) => (
                        <div key={item.id} className="flex items-start gap-3">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] bg-slate-50">
                            <Image
                              src={item.image || "/images/product.webp"}
                              alt={item.name}
                              width={56}
                              height={56}
                              className="h-auto w-auto max-h-[46px] max-w-[46px] object-contain"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <Link
                              href="/cart"
                              className="line-clamp-2 text-[15px] leading-6 text-ink-900 transition-colors hover:text-black"
                            >
                              {item.name}
                            </Link>
                            {getCartMeta(item) && (
                              <p className="mt-0.5 text-[13px] leading-5 text-ink-600">
                                {getCartMeta(item)}
                              </p>
                            )}
                            <div className="mt-1 flex items-center gap-2 text-[13px] text-ink-800">
                              <span>{item.qty} x {formatPrice(item.price)}</span>
                              {item.oldPrice ? (
                                <span className="text-ink-400 line-through">
                                  {formatPrice(item.oldPrice)}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-rose-500 transition-colors hover:bg-rose-50"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {hiddenItemsCount > 0 && (
                      <p className="mt-3 text-[12px] text-ink-500">
                        +{hiddenItemsCount} more item{hiddenItemsCount === 1 ? "" : "s"} in cart
                      </p>
                    )}

                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <div className="flex items-center justify-between text-[15px] font-semibold text-ink-900">
                        <span>সাব টোটাল</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <Link
                          href="/cart"
                          className="inline-flex h-11 flex-1 items-center justify-center rounded-[10px] border border-slate-900 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
                        >
                          কার্ট দেখুন
                        </Link>
                        <Link
                          href="/checkout"
                          className="inline-flex h-11 flex-1 items-center justify-center rounded-[10px] bg-slate-950 text-sm font-semibold text-white transition-colors hover:bg-black"
                        >
                          চেকআউট
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center py-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                      <ShoppingBag size={22} />
                    </div>
                    <h3 className="mt-3 text-[16px] font-semibold text-ink-900">Your cart is empty</h3>
                    <p className="mt-1 max-w-[240px] text-sm leading-6 text-ink-500">
                      Add a few products and they will appear here for quick checkout.
                    </p>
                    <Link
                      href="/products"
                      className="mt-4 inline-flex h-11 items-center justify-center rounded-[10px] bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-black"
                    >
                      Browse products
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link
          href={accountHref}
          className="inline-flex items-center gap-2 text-white"
          aria-label={isAuthenticated ? "My account" : "Login"}
          title={isAuthenticated ? "My account" : "Login"}
        >
          <span className="text-[#f58a1f]">
            <User size={20} strokeWidth={2.1} />
          </span>
          <span className="leading-none">
            <span className="block text-[12px] font-semibold text-[#f3f3f3]">Account</span>
            <span className="mt-0.5 block text-[10px] text-[#bfbfbf]">
              {isAuthenticated ? "My dashboard" : "Register or Login"}
            </span>
          </span>
        </Link>
      </div>
    </>
  );
}
