"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Search, ShoppingCart, User } from "lucide-react";

export default function MobileHeaderBar({
  accountHref,
  count,
  isAuthenticated,
  isMobileCategoryMenuOpen,
  onSearchChange,
  onSearchSubmit,
  onToggleMenu,
  searchValue,
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onToggleMenu}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/10 bg-[#121212] text-white"
          aria-label={isMobileCategoryMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileCategoryMenuOpen}
          aria-controls="mobile-category-menu"
        >
          <Menu size={22} />
        </button>

        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo-1025b.webp"
            alt="GADGETSHOB"
            width={122}
            height={36}
            className="h-auto w-auto"
            style={{ width: "auto", height: "auto" }}
            priority
          />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={accountHref}
            className="inline-flex h-11 w-11 items-center justify-center text-white"
            aria-label={isAuthenticated ? "Account" : "Login"}
            title={isAuthenticated ? "Account" : "Login"}
          >
            <User size={22} />
          </Link>

          <Link href="/cart" className="relative inline-flex h-11 w-11 items-center justify-center text-white">
            <ShoppingCart size={22} />
            <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#f58a1f] text-[11px] font-medium text-white">
              {count}
            </span>
          </Link>
        </div>
      </div>

      <form
        onSubmit={onSearchSubmit}
        className="mt-3 flex h-11 items-center overflow-hidden rounded-full border border-[#d7d7d7] bg-white pl-4 pr-1.5"
      >
        <input
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Search products..."
          className="h-full flex-1 bg-transparent text-[15px] text-[#4b4b4b] outline-none"
        />
        <button
          type="submit"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f58a1f] text-white"
          aria-label="Search products"
        >
          <Search size={16} />
        </button>
      </form>
    </>
  );
}
