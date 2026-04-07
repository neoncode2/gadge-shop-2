"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { categories } from "@/data/filters";
import { getRoleHomePath } from "@/lib/roles";
import { useCart } from "./CartProvider";
import DesktopHeaderBar from "./header/DesktopHeaderBar";
import MobileCategoryDrawer from "./header/MobileCategoryDrawer";
import MobileHeaderBar from "./header/MobileHeaderBar";

const NAV_LINKS = categories.map((category) => ({
  href: {
    pathname: "/products",
    query: { category },
  },
  label: category,
}));

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-[120] shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
      <div className="bg-black">
        <div className="mx-auto w-[calc(100%-24px)] max-w-[1240px] py-3.5 md:py-4">
          <div className="h-10 md:h-[40px]" />
        </div>
      </div>
      <div className="hidden border-b border-[#e8e3de] bg-[#f5f2ef] md:block">
        <div className="mx-auto h-[41px] w-[calc(100%-24px)] max-w-[1240px]" />
      </div>
    </header>
  );
}

function HeaderContent() {
  const { count } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shouldReduceMotion = useReducedMotion();
  const lastScrollYRef = useRef(0);
  const [hasMounted, setHasMounted] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isMobileCategoryMenuOpen, setIsMobileCategoryMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const safeCount = hasMounted ? count : 0;
  const isAuthenticated = hasMounted ? Boolean(session?.user) : false;
  const accountHref = isAuthenticated ? getRoleHomePath(session?.user?.role) : "/login";
  const activeCategory = searchParams.get("category") || "";

  const closeMobileCategoryMenu = () => {
    setIsMobileCategoryMenuOpen(false);
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const scrollDelta = currentScrollY - lastScrollYRef.current;

      if (currentScrollY <= 40) {
        setIsNavVisible(true);
      } else if (scrollDelta > 6 && currentScrollY > 120) {
        setIsNavVisible(false);
      } else if (scrollDelta < -6) {
        setIsNavVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    closeMobileCategoryMenu();
  }, [pathname, activeCategory]);

  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    if (!isMobileCategoryMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMobileCategoryMenu();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileCategoryMenuOpen]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = searchValue.trim();
    router.push(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
  };

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const navTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] };

  return (
    <>
      <header className="sticky top-0 z-[120] shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
        <div className="bg-black">
          <div className="mx-auto w-[calc(100%-24px)] max-w-[1240px] py-3.5 md:py-4">
            <div className="md:hidden">
              <MobileHeaderBar
                accountHref={accountHref}
                count={safeCount}
                isAuthenticated={isAuthenticated}
                isMobileCategoryMenuOpen={isMobileCategoryMenuOpen}
                onSearchChange={handleSearchChange}
                onSearchSubmit={handleSearchSubmit}
                onToggleMenu={() => setIsMobileCategoryMenuOpen((current) => !current)}
                searchValue={searchValue}
              />
            </div>

            <div className="hidden items-center justify-between gap-6 md:flex">
              <DesktopHeaderBar
                accountHref={accountHref}
                count={safeCount}
                isAuthenticated={isAuthenticated}
                onSearchChange={handleSearchChange}
                onSearchSubmit={handleSearchSubmit}
                searchValue={searchValue}
              />
            </div>
          </div>
        </div>

        <motion.div
          initial={false}
          animate={
            isNavVisible
              ? { height: "auto", opacity: 1, y: 0 }
              : { height: 0, opacity: 0, y: -14 }
          }
          transition={navTransition}
          style={{ pointerEvents: isNavVisible ? "auto" : "none" }}
          className="hidden w-full overflow-hidden border-b border-[#e8e3de] bg-[#f5f2ef] md:block"
        >
          <nav className="mx-auto flex w-[calc(100%-24px)] max-w-[1240px] items-center justify-center gap-6 py-2.5 text-sm font-medium text-[#5e5b59]">
            {NAV_LINKS.map((item) => {
              const isActive = pathname === "/products" && activeCategory === item.label;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group relative py-1 text-[12px] transition-colors duration-200 ${
                    isActive ? "text-[#f58a1f]" : "hover:text-[#f58a1f]"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-0 -bottom-[10px] h-0.5 origin-left rounded-full bg-[#f58a1f] transition-transform duration-200 ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </motion.div>
      </header>

      <MobileCategoryDrawer
        activeCategory={activeCategory}
        isOpen={isMobileCategoryMenuOpen}
        onClose={closeMobileCategoryMenu}
        pathname={pathname}
      />
    </>
  );
}

export default function Header() {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <HeaderContent />
    </Suspense>
  );
}
