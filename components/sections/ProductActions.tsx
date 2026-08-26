"use client";

import { Loader2, Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

export function ProductActions({ productId, inStock }: { productId: string; inStock: boolean }) {
  const t = useTranslations("shop.product");
  const cart = useCart();
  const wishlist = useWishlist();

  const line = cart.getLine(productId);
  const cartBusy = cart.isPending(productId);
  const wishlistBusy = wishlist.isPending(productId);
  const saved = wishlist.has(productId);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {line ? (
        <div className="flex h-11 items-center justify-between rounded-none border border-gold-600/40 bg-gold-50 px-2 text-gold-700 sm:w-40">
          <button
            type="button"
            onClick={() => cart.setQuantity(productId, line.quantity - 1)}
            aria-label={t("decreaseQuantity")}
            disabled={cartBusy}
            className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-gold-100 disabled:opacity-60"
          >
            {cartBusy ? <Loader2 className="size-4 animate-spin" /> : <Minus className="size-4" />}
          </button>
          <span className="text-sm font-semibold">{line.quantity}</span>
          <button
            type="button"
            onClick={() => cart.setQuantity(productId, line.quantity + 1)}
            aria-label={t("increaseQuantity")}
            disabled={cartBusy}
            className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-gold-100 disabled:opacity-60"
          >
            <Plus className="size-4" />
          </button>
        </div>
      ) : (
        <Button size="lg" disabled={!inStock || cartBusy} onClick={() => cart.addToCart(productId)}>
          {cartBusy && <Loader2 className="size-4 animate-spin" />}
          {cartBusy ? t("addingToCart") : t("addToCart")}
        </Button>
      )}
      <Button
        variant="outline"
        size="lg"
        disabled={wishlistBusy}
        onClick={() => wishlist.toggle(productId)}
      >
        {wishlistBusy && <Loader2 className="size-4 animate-spin" />}
        {saved ? t("addedToWishlist") : t("addToWishlist")}
      </Button>
    </div>
  );
}
