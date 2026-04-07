"use client";

import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { categories } from "@/data/filters";

export default function MobileCategoryDrawer({
  activeCategory,
  isOpen,
  onClose,
  pathname,
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-[220] transition-opacity duration-300 md:hidden ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute inset-0 bg-white/70 backdrop-blur-[2px]"
          aria-label="Close category menu"
        />
      </div>

      <div
        id="mobile-category-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Product categories"
        className={`fixed left-0 top-0 z-[230] flex h-[100dvh] w-[84vw] max-w-[320px] flex-col bg-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-transform duration-300 ease-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-slate-200 bg-white px-5 py-4 text-ink-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-ink-400">Browse</p>
              <h2 className="mt-1 text-lg font-semibold">Categories</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-ink-700"
              aria-label="Close category menu"
            >
              <X size={18} />
            </button>
          </div>
          <p className="mt-3 text-sm text-ink-500">
            Choose a category to see matching products.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          <Link
            href="/products"
            onClick={onClose}
            className={`flex items-center justify-between rounded-[8px] px-4 py-3 text-sm transition-colors ${
              pathname === "/products" && !activeCategory
                ? "bg-black font-medium text-white"
                : "text-ink-800 hover:bg-slate-50"
            }`}
          >
            <span>All Products</span>
            <ChevronRight size={16} />
          </Link>

          <div className="mt-2 space-y-1">
            {categories.map((category) => {
              const isActive = pathname === "/products" && activeCategory === category;

              return (
                <Link
                  key={category}
                  href={{
                    pathname: "/products",
                    query: { category },
                  }}
                  onClick={onClose}
                  className={`flex items-center justify-between rounded-[8px] px-4 py-3 text-sm transition-colors ${
                    isActive
                      ? "bg-black font-medium text-white"
                      : "text-ink-800 hover:bg-slate-50"
                  }`}
                >
                  <span>{category}</span>
                  <ChevronRight size={16} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
