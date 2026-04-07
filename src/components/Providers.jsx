"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "./CartProvider";
import { WishlistProvider } from "./WishlistProvider";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <WishlistProvider>
        <CartProvider>{children}</CartProvider>
      </WishlistProvider>
    </SessionProvider>
  );
}
