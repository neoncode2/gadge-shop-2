"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import api, { getApiErrorMessage } from "@/lib/api";

const WishlistContext = createContext(null);

function normalizeWishlistProduct(product) {
  return {
    id: String(product?.id || ""),
    name: String(product?.name || ""),
    image: product?.image || "/images/product.webp",
    wishlisted: true,
    price: Number(product?.price || 0),
    oldPrice: product?.oldPrice ? Number(product.oldPrice) : null,
    rating: Number(product?.rating || 0),
    reviewCount: Number(product?.reviewCount || 0),
    brand: String(product?.brand || ""),
    category: String(product?.category || ""),
    categories: Array.isArray(product?.categories) ? product.categories : [],
    sections: Array.isArray(product?.sections) ? product.sections : [],
    tag: String(product?.tag || ""),
  };
}

export function WishlistProvider({ children }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingIds, setPendingIds] = useState([]);
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (status === "loading") return undefined;

    const userId = session?.user?.id;

    if (!userId) {
      setItems([]);
      setPendingIds([]);
      setIsLoading(false);
      setInitialized(true);
      return undefined;
    }

    let isActive = true;

    setInitialized(false);
    setIsLoading(true);

    api
      .get("/api/wishlist")
      .then((response) => {
        if (!isActive) return;

        const nextItems = Array.isArray(response.data?.items)
          ? response.data.items.map(normalizeWishlistProduct)
          : [];

        setItems(nextItems);
      })
      .catch(() => {
        if (!isActive) return;
        setItems([]);
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoading(false);
        setInitialized(true);
      });

    return () => {
      isActive = false;
    };
  }, [session?.user?.id, status]);

  const value = useMemo(() => {
    const updatePendingState = (productId, isPending) => {
      setPendingIds((current) => {
        const normalizedProductId = String(productId || "");

        if (!normalizedProductId) {
          return current;
        }

        if (isPending) {
          return current.includes(normalizedProductId)
            ? current
            : [...current, normalizedProductId];
        }

        return current.filter((item) => item !== normalizedProductId);
      });
    };

    const addItem = async (product) => {
      if (!session?.user?.id) {
        return {
          ok: false,
          requiresAuth: true,
          message: "Please log in to save wishlist items.",
        };
      }

      const normalizedProduct = normalizeWishlistProduct(product);
      const productId = normalizedProduct.id;

      if (!productId) {
        return {
          ok: false,
          message: "Invalid product.",
        };
      }

      const previousItems = itemsRef.current;

      updatePendingState(productId, true);
      setItems((current) =>
        current.some((item) => item.id === productId)
          ? current
          : [normalizedProduct, ...current]
      );

      try {
        const response = await api.post("/api/wishlist", { productId });
        const serverItem = normalizeWishlistProduct(response.data?.item || normalizedProduct);

        setItems((current) => [
          serverItem,
          ...current.filter((item) => item.id !== productId),
        ]);

        return {
          ok: true,
          wished: true,
        };
      } catch (error) {
        setItems(previousItems);

        return {
          ok: false,
          message: getApiErrorMessage(error, "Unable to save this wishlist item."),
        };
      } finally {
        updatePendingState(productId, false);
      }
    };

    const removeItem = async (productId) => {
      const normalizedProductId = String(productId || "");

      if (!session?.user?.id) {
        return {
          ok: false,
          requiresAuth: true,
          message: "Please log in to update your wishlist.",
        };
      }

      if (!normalizedProductId) {
        return {
          ok: false,
          message: "Invalid product.",
        };
      }

      const previousItems = itemsRef.current;

      updatePendingState(normalizedProductId, true);
      setItems((current) => current.filter((item) => item.id !== normalizedProductId));

      try {
        await api.delete("/api/wishlist", {
          data: { productId: normalizedProductId },
        });

        return {
          ok: true,
          wished: false,
        };
      } catch (error) {
        setItems(previousItems);

        return {
          ok: false,
          message: getApiErrorMessage(error, "Unable to remove this wishlist item."),
        };
      } finally {
        updatePendingState(normalizedProductId, false);
      }
    };

    return {
      items,
      count: items.length,
      initialized,
      isLoading,
      isAuthenticated: Boolean(session?.user),
      isWishlisted: (productId) =>
        items.some((item) => item.id === String(productId || "")),
      isPending: (productId) =>
        pendingIds.includes(String(productId || "")),
      addItem,
      removeItem,
      toggleItem: async (product) => {
        const productId = String(product?.id || "");

        return itemsRef.current.some((item) => item.id === productId)
          ? removeItem(productId)
          : addItem(product);
      },
    };
  }, [initialized, isLoading, items, pendingIds, session?.user]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }

  return context;
}
