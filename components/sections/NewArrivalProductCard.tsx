"use client";

import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, type MouseEvent } from "react";

import { Link, useRouter } from "@/i18n/navigation";
import { emitCartUpdated } from "@/lib/cart-events";
import { LOW_STOCK_THRESHOLD, hasDiscount, productName, type Product } from "@/lib/shop-types";
import { cn } from "@/lib/utils";

type ActionStatus = "idle" | "loading" | "done";
type CartItem = { id: string; productId: string; quantity: number };

export function NewArrivalProductCard({ product }: { product: Product }) {
  const locale = useLocale();
  const t = useTranslations("shop");
  const router = useRouter();
  const [wishlistStatus, setWishlistStatus] = useState<ActionStatus>("idle");
  const [cartItemId, setCartItemId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cartBusy, setCartBusy] = useState(false);

  const image = product.images[0]?.url;
  const inStock = product.stockQuantity > 0;
  const lowStock = inStock && product.stockQuantity <= LOW_STOCK_THRESHOLD;
  const discounted = hasDiscount(product);

  async function quickAction(
    event: MouseEvent,
    path: string,
    status: ActionStatus,
    setStatus: (status: ActionStatus) => void,
  ) {
    event.preventDefault();
    event.stopPropagation();
    if (status !== "idle") return;

    setStatus("loading");
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    });

    if (res.status === 401 || res.status === 403) {
      router.push("/login");
      return;
    }
    setStatus(res.ok ? "done" : "idle");
  }

  async function addToCart(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (cartBusy) return;

    setCartBusy(true);
    const res = await fetch("/api/backend/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    });

    if (res.status === 401 || res.status === 403) {
      router.push("/login");
      return;
    }

    if (res.ok) {
      const cart = await res.json();
      const item = (cart.items as CartItem[] | undefined)?.find((i) => i.productId === product.id);
      if (item) {
        setCartItemId(item.id);
        setQuantity(item.quantity);
      }
      emitCartUpdated();
    }
    setCartBusy(false);
  }

  async function changeQuantity(event: MouseEvent, delta: number) {
    event.preventDefault();
    event.stopPropagation();
    if (!cartItemId || cartBusy) return;

    const next = quantity + delta;
    setCartBusy(true);

    if (next < 1) {
      await fetch(`/api/backend/cart/items/${cartItemId}`, { method: "DELETE" });
      setCartItemId(null);
      setQuantity(1);
      emitCartUpdated();
      setCartBusy(false);
      return;
    }

    const res = await fetch(`/api/backend/cart/items/${cartItemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: next }),
    });
    if (res.ok) setQuantity(next);
    emitCartUpdated();
    setCartBusy(false);
  }

  return (
    <Link href={`/shop/${product.slug}`} className="group flex h-full w-40 shrink-0 flex-col items-center text-center sm:w-48">
      <div className="relative aspect-square w-full overflow-hidden rounded-full bg-gradient-to-br from-gold-200 to-gold-400">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={productName(product, locale)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
            <span className="text-xs font-medium text-foreground">{t("outOfStock")}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col items-center">
        <h3 className="mt-4 font-heading text-base text-foreground">{productName(product, locale)}</h3>
        <div className="mt-1 flex items-center gap-2 text-sm font-medium">
          <span className="text-gold-600">{Number(product.price).toFixed(2)}</span>
          {discounted && (
            <span className="text-muted-foreground line-through">
              {Number(product.compareAtPrice).toFixed(2)}
            </span>
          )}
        </div>
        {lowStock && (
          <span className="mt-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
            {t("onlyLeft", { count: product.stockQuantity })}
          </span>
        )}
      </div>
      <div className="mt-3 flex w-full flex-nowrap items-center gap-1.5">
        <button
          type="button"
          onClick={(event) => quickAction(event, "/api/backend/wishlist", wishlistStatus, setWishlistStatus)}
          aria-label={t("product.addToWishlist")}
          disabled={wishlistStatus !== "idle"}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-colors hover:text-destructive disabled:opacity-70"
        >
          <Heart className={cn("size-5", wishlistStatus === "done" && "fill-current text-destructive")} />
        </button>

        {inStock &&
          (cartItemId ? (
            <div className="flex h-10 min-w-0 flex-1 items-center justify-between rounded-full border border-gold-600/40 bg-gold-50 px-1 text-gold-700">
              <button
                type="button"
                onClick={(event) => changeQuantity(event, -1)}
                aria-label={t("product.decreaseQuantity")}
                disabled={cartBusy}
                className="flex size-6 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-gold-100 disabled:opacity-60"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="text-xs font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={(event) => changeQuantity(event, 1)}
                aria-label={t("product.increaseQuantity")}
                disabled={cartBusy}
                className="flex size-6 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-gold-100 disabled:opacity-60"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={addToCart}
              aria-label={t("product.addToCart")}
              disabled={cartBusy}
              className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-full bg-gold-600 px-2 text-xs font-medium text-white transition-colors hover:bg-gold-700 disabled:opacity-70"
            >
              <ShoppingBag className="size-3.5 shrink-0" />
              <span className="truncate">{t("product.addToCart")}</span>
            </button>
          ))}
      </div>
    </Link>
  );
}
