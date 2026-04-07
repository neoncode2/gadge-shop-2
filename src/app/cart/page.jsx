"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import Link from "next/link";
import { Check, Minus, Plus, X } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/format";

function CartCheck() {
  return (
    <span className="inline-flex h-[14px] w-[14px] items-center justify-center rounded-[2px] bg-black text-white">
      <Check size={11} strokeWidth={3} />
    </span>
  );
}

export default function CartPage() {
  const { items, subtotal, updateQty, removeItem } = useCart();
  const discount = items.length > 0 ? 556 : 0;
  const total = Math.max(0, subtotal - discount);
  const suggestions = products.slice(0, 6);

  const cartItems = items.map((item) => {
    const fullProduct = products.find((product) => product.id === item.id) || item;

    return {
      ...item,
      details: fullProduct,
      category: fullProduct?.category || item.category || "Products",
      strapSize: fullProduct?.strapSizes?.[0] || item.strapSizes?.[0] || "Standard",
      color: fullProduct?.colors?.[1] || fullProduct?.colors?.[0] || item.colors?.[0] || "Default",
    };
  });

  return (
    <div>
      <Header />
      <main className="mx-auto mt-6 w-[calc(100%-32px)] max-w-[1240px] md:mt-8">
        <section className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-[minmax(0,1fr)_230px] lg:gap-9">
          <div>
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-[22px] font-semibold text-ink-900 md:text-[24px]">আমার কার্ট</h1>
              <span className="inline-flex min-w-[78px] items-center justify-center rounded-[4px] bg-black px-3 py-1.5 text-sm font-medium text-white">
                {items.length} Items
              </span>
            </div>

            <div className="hidden border-b border-slate-200 py-4 text-[15px] font-medium text-ink-800 md:grid md:grid-cols-[minmax(0,1fr)_126px_120px_110px_30px] md:gap-4">
              <div className="flex items-center gap-2">
                <CartCheck />
                <span>PRODUCT DETAILS</span>
              </div>
              <div className="text-center">QUANTITY</div>
              <div className="text-center">PRICE</div>
              <div className="text-center">TOTAL</div>
              <div />
            </div>

            <div>
              {cartItems.length === 0 ? (
                <div className="border-b border-slate-200 py-12 text-center text-ink-500">
                  Cart is empty. <Link href="/products" className="font-medium text-ink-800">Shop now</Link>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-slate-200 py-4 md:grid md:grid-cols-[minmax(0,1fr)_126px_120px_110px_30px] md:items-center md:gap-4 md:py-5"
                  >
                    <div className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)] md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="pt-1.5 md:pt-2">
                            <CartCheck />
                          </div>
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-[72px] w-[60px] shrink-0 items-center justify-center rounded-[8px] border border-slate-300 bg-white md:h-[60px] md:w-[48px] md:rounded-[4px]">
                              <Image
                                src={item.details?.image || item.image}
                                alt={item.name}
                                width={40}
                                height={52}
                                className="h-auto w-auto max-h-[56px] max-w-[40px] object-contain md:max-h-[48px] md:max-w-[34px]"
                                sizes="(max-width: 767px) 40px, 34px"
                              />
                            </div>
                            <div className="min-w-0 pt-0.5 md:max-w-[290px]">
                              <Link
                                href={`/product/${item.id}`}
                                className="line-clamp-2 text-[16px] font-semibold leading-[1.3] text-[#6952d7] md:text-[18px] md:leading-[1.2]"
                              >
                                {item.name}
                              </Link>
                              <p className="mt-1 text-[12px] text-ink-600 md:text-[13px]">Category: {item.category}</p>
                              <p className="mt-1 text-[12px] leading-5 text-ink-600 md:text-[13px]">
                                Strap Size: {item.strapSize}, Color: {item.color}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="shrink-0 text-[#c8c8cd] transition-colors hover:text-ink-700 md:hidden"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <X size={18} strokeWidth={2.2} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-3 md:contents">
                      <div className="min-w-0 md:flex md:items-center md:justify-center">
                        <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 md:hidden">
                          Quantity
                        </p>
                        <div className="flex items-center justify-center gap-2 md:gap-3">
                          <button
                            type="button"
                            className="text-lg leading-none text-ink-700"
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <Minus size={14} strokeWidth={2.4} />
                          </button>
                          <span className="inline-flex h-[30px] min-w-[30px] items-center justify-center rounded-[6px] border border-slate-400 bg-white px-1.5 text-[13px] text-ink-900 md:h-[26px] md:min-w-[28px] md:rounded-[2px] md:px-2 md:text-[14px]">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            className="text-lg leading-none text-ink-700"
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <Plus size={14} strokeWidth={2.4} />
                          </button>
                        </div>
                      </div>

                      <div className="min-w-0 text-center md:py-0">
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 md:hidden">
                          Price
                        </p>
                        <p className="text-[15px] font-semibold text-ink-900 md:text-[18px]">{formatPrice(item.price)}</p>
                        {item.details?.oldPrice && (
                          <p className="mt-1 text-[11px] text-[#c6c6cc] line-through md:text-[13px]">
                            {formatPrice(item.details.oldPrice)}
                          </p>
                        )}
                      </div>

                      <div className="min-w-0 text-center md:py-0">
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 md:hidden">
                          Total
                        </p>
                        <p className="text-[15px] font-semibold text-ink-900 md:text-[18px]">{formatPrice(item.price * item.qty)}</p>
                      </div>
                    </div>

                    <div className="hidden justify-start md:mt-0 md:flex md:justify-center">
                      <button
                        type="button"
                        className="text-[#c8c8cd] transition-colors hover:text-ink-700"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <X size={16} strokeWidth={2.2} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <aside className="h-fit rounded-[16px] border border-slate-900 bg-white p-5 md:p-6 lg:sticky lg:top-6">
            <h2 className="text-[22px] font-semibold text-ink-900">অর্ডার সারাংশ</h2>
            <div className="mt-6 space-y-4 border-t border-slate-200 pt-4 text-[15px] text-ink-800">
              <div className="flex items-center justify-between">
                <span>সাব টোটাল</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ডিসকাউন্ট</span>
                <span>{formatPrice(discount)}</span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span>সর্বমোট</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-5 block rounded-[3px] bg-black px-4 py-3 text-center text-sm font-semibold text-white"
            >
              চেকআউট
            </Link>
          </aside>
        </section>

        <section className="mt-14">
          <h2 className="text-[26px] font-semibold text-ink-900 md:text-[30px]">You May Like</h2>
          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {suggestions.map((product) => (
                <ProductCard key={product.id} product={product} compact />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
