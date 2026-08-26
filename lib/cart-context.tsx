"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

import { toastManager } from "@/components/ui/toast";
import { useRouter } from "@/i18n/navigation";
import { CART_UPDATED_EVENT, emitCartUpdated } from "@/lib/cart-events";

export type CartLine = { id: string; productId: string; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  getLine: (productId: string) => CartLine | undefined;
  isPending: (productId: string) => boolean;
  addToCart: (productId: string) => Promise<void>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function toLines(items: { id: string; productId: string; quantity: number }[]): CartLine[] {
  return items.map((item) => ({ id: item.id, productId: item.productId, quantity: item.quantity }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
  const t = useTranslations("shop.product");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!userId) {
        if (!cancelled) setLines([]);
        return;
      }
      const res = await fetch("/api/backend/cart");
      if (!res.ok || cancelled) return;
      const data = await res.json();
      if (!cancelled) setLines(toLines(data.items ?? []));
    }

    load();
    window.addEventListener(CART_UPDATED_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(CART_UPDATED_EVENT, load);
    };
  }, [userId]);

  function setPending(productId: string, value: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(productId);
      else next.delete(productId);
      return next;
    });
  }

  const addToCart = useCallback(
    async (productId: string) => {
      if (pendingIds.has(productId)) return;
      setPending(productId, true);

      const res = await fetch("/api/backend/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (res.status === 401 || res.status === 403) {
        setPending(productId, false);
        router.push("/login");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setLines(toLines(data.items ?? []));
        emitCartUpdated();
        toastManager.add({ title: t("addedToCart"), type: "cart" });
      } else {
        toastManager.add({ title: t("actionFailed"), type: "error" });
      }
      setPending(productId, false);
    },
    [pendingIds, router, t],
  );

  const setQuantity = useCallback(
    async (productId: string, quantity: number) => {
      const line = lines.find((l) => l.productId === productId);
      if (!line || pendingIds.has(productId)) return;

      setPending(productId, true);

      if (quantity < 1) {
        await fetch(`/api/backend/cart/items/${line.id}`, { method: "DELETE" });
        setLines((prev) => prev.filter((l) => l.productId !== productId));
      } else {
        await fetch(`/api/backend/cart/items/${line.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        });
        setLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, quantity } : l)));
      }
      emitCartUpdated();
      setPending(productId, false);
    },
    [lines, pendingIds],
  );

  const value: CartContextValue = {
    lines,
    getLine: (productId) => lines.find((l) => l.productId === productId),
    isPending: (productId) => pendingIds.has(productId),
    addToCart,
    setQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
