"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { trackMetaPixelEvent } from "@/lib/meta-pixel-client";

const CartContext = createContext(null);

const initialState = {
  items: [],
};

function cartReducer(state, action) {
  switch (action.type) {
    case "INIT":
      return { ...state, items: action.payload || [] };
    case "ADD": {
      const existing = state.items.find((item) => item.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, ...action.payload, qty: item.qty + action.payload.qty }
              : item
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case "UPDATE": {
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.id === action.payload.id
              ? { ...item, qty: Math.max(1, action.payload.qty) }
              : item
          )
          .filter((item) => item.qty > 0),
      };
    }
    case "REMOVE": {
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    }
    case "CLEAR":
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("cart") : null;
    if (stored) {
      dispatch({ type: "INIT", payload: JSON.parse(stored) });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(state.items));
    }
  }, [state.items]);

  const value = useMemo(() => {
    const subtotal = state.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
    const count = state.items.reduce((sum, item) => sum + item.qty, 0);

    return {
      items: state.items,
      subtotal,
      count,
      addItem: (product, qty = 1) => {
        dispatch({
          type: "ADD",
          payload: {
            id: product.id,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice || null,
            image: product.image,
            category: product.category || "",
            brand: product.brand || "",
            colors: product.colors || [],
            strapSizes: product.strapSizes || [],
            qty,
          },
        });

        void trackMetaPixelEvent("AddToCart", {
          currency: "BDT",
          value: Number(product?.price || 0) * qty,
          content_ids: [String(product?.id || "")],
          content_name: product?.name || "Product",
          content_type: "product",
          num_items: qty,
          contents: [
            {
              id: String(product?.id || ""),
              quantity: qty,
              item_price: Number(product?.price || 0),
            },
          ],
        });
      },
      updateQty: (id, qty) => dispatch({ type: "UPDATE", payload: { id, qty } }),
      removeItem: (id) => dispatch({ type: "REMOVE", payload: id }),
      clear: () => dispatch({ type: "CLEAR" }),
    };
  }, [state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
