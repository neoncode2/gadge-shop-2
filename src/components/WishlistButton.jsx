"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Heart } from "lucide-react";
import { useWishlist } from "./WishlistProvider";

function WishlistButtonFallback({
  buttonClassName = "",
  inactiveIconClassName = "product-card-accent-icon",
  iconSize = 18,
}) {
  return (
    <button
      type="button"
      disabled
      className={buttonClassName}
      aria-label="Wishlist loading"
      aria-hidden="true"
    >
      <Heart
        size={iconSize}
        strokeWidth={1.8}
        className={inactiveIconClassName}
        fill="none"
      />
    </button>
  );
}

function WishlistButtonContent({
  product,
  buttonClassName = "",
  activeIconClassName = "text-rose-500",
  inactiveIconClassName = "product-card-accent-icon",
  iconSize = 18,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isPending, isWishlisted, toggleItem } = useWishlist();
  const [localError, setLocalError] = useState("");
  const [hasMounted, setHasMounted] = useState(false);
  const productId = String(product?.id || "");
  const active = Boolean(product?.wishlisted) || (hasMounted && isWishlisted(productId));
  const pending = hasMounted && isPending(productId);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    setLocalError("");

    const result = await toggleItem(product);

    if (result?.requiresAuth) {
      const query = searchParams?.toString();
      const hash =
        typeof window !== "undefined" ? window.location.hash || "" : "";
      const redirectTo = `${pathname}${query ? `?${query}` : ""}${hash}`;

      router.push(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
      return;
    }

    if (!result?.ok && result?.message) {
      setLocalError(result.message);

      if (typeof window !== "undefined") {
        window.setTimeout(() => setLocalError(""), 2500);
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={`${buttonClassName} ${pending ? "opacity-70" : ""}`}
        aria-label={
          active
            ? `Remove ${product?.name || "product"} from wishlist`
            : `Save ${product?.name || "product"} to wishlist`
        }
        aria-pressed={active}
        title={
          localError ||
          (active ? "Remove from wishlist" : "Save to wishlist")
        }
      >
        <Heart
          size={iconSize}
          strokeWidth={1.8}
          className={active ? activeIconClassName : inactiveIconClassName}
          fill={active ? "currentColor" : "none"}
        />
      </button>
    </>
  );
}

export default function WishlistButton(props) {
  return (
    <Suspense
      fallback={
        <WishlistButtonFallback
          buttonClassName={props.buttonClassName}
          inactiveIconClassName={props.inactiveIconClassName}
          iconSize={props.iconSize}
        />
      }
    >
      <WishlistButtonContent {...props} />
    </Suspense>
  );
}
