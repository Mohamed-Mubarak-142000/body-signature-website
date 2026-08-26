"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

import { toastManager } from "@/components/ui/toast";
import { useRouter } from "@/i18n/navigation";

type WishlistContextValue = {
  has: (productId: string) => boolean;
  isPending: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
  const t = useTranslations("shop.product");
  const [productIds, setProductIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!userId) {
        if (!cancelled) setProductIds(new Set());
        return;
      }
      const res = await fetch("/api/backend/wishlist");
      if (!res.ok || cancelled) return;
      const data = await res.json();
      const items: { productId: string }[] = data.items ?? [];
      if (!cancelled) setProductIds(new Set(items.map((item) => item.productId)));
    }

    load();
    return () => {
      cancelled = true;
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

  const toggle = useCallback(
    async (productId: string) => {
      if (pendingIds.has(productId)) return;
      const alreadySaved = productIds.has(productId);
      setPending(productId, true);

      const res = alreadySaved
        ? await fetch(`/api/backend/wishlist/items/${productId}`, { method: "DELETE" })
        : await fetch("/api/backend/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });

      if (res.status === 401 || res.status === 403) {
        setPending(productId, false);
        router.push("/login");
        return;
      }

      if (res.ok) {
        setProductIds((prev) => {
          const next = new Set(prev);
          if (alreadySaved) next.delete(productId);
          else next.add(productId);
          return next;
        });
        toastManager.add({
          title: alreadySaved ? t("removedFromWishlist") : t("addedToWishlist"),
          type: "wishlist",
        });
      } else {
        toastManager.add({ title: t("actionFailed"), type: "error" });
      }
      setPending(productId, false);
    },
    [pendingIds, productIds, router, t],
  );

  const value: WishlistContextValue = {
    has: (productId) => productIds.has(productId),
    isPending: (productId) => pendingIds.has(productId),
    toggle,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
