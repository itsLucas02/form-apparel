"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/cart-provider";

/** After checkout completes the cart cookie is cleared; sync the client-side cart state. */
export function ResetCartOnMount() {
  const { refresh } = useCart();
  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
