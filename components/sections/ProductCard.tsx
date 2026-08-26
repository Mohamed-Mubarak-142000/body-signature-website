"use client";

import { ArrowRight, Heart, ShoppingBag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, type MouseEvent } from "react";

import { Link, useRouter } from "@/i18n/navigation";
import { emitCartUpdated } from "@/lib/cart-events";
import {
  LOW_STOCK_THRESHOLD,
  hasDiscount,
  productDescription,
  productName,
  type Product,
} from "@/lib/shop-types";
import { cn } from "@/lib/utils";

type ActionStatus = "idle" | "loading" | "done";

export function ProductCard({ product }: { product: Product }) {
  const locale = useLocale();
  const t = useTranslations("shop");
  const router = useRouter();
  const [cartStatus, setCartStatus] = useState<ActionStatus>("idle");
  const [wishlistStatus, setWishlistStatus] = useState<ActionStatus>("idle");

  const image = product.images[0]?.url;
  const inStock = product.stockQuantity > 0;
  const lowStock = inStock && product.stockQuantity <= LOW_STOCK_THRESHOLD;
  const discounted = hasDiscount(product);
  const description = productDescription(product, locale);

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
    if (res.ok && path.includes("/cart")) emitCartUpdated();
  }

  return (
    <div className="h-full">
      <Link
        href={`/shop/${product.slug}`}
        className="group flex h-full flex-col overflow-hidden border border-border/70 bg-card"
      >
        <div className="relative aspect-[4/5] shrink-0 overflow-hidden bg-gradient-to-br from-gold-200 to-gold-400">
          {image && (
            // Product photo URLs come from wherever staff pasted them (no
            // upload pipeline yet) — using a plain <img> avoids needing every
            // possible host allow-listed in next.config's image remotePatterns.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={productName(product, locale)}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          {product.stockQuantity <= 0 && (
            <span className="absolute top-3 rtl:right-3 ltr:left-3 bg-background/90 px-2 py-1 text-xs font-medium text-foreground">
              {t("outOfStock")}
            </span>
          )}

          <button
            type="button"
            onClick={(event) => quickAction(event, "/api/backend/wishlist", wishlistStatus, setWishlistStatus)}
            aria-label={t("product.addToWishlist")}
            className="absolute top-3 z-10 flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:text-destructive rtl:left-3 ltr:right-3"
          >
            <Heart className={cn("size-4", wishlistStatus === "done" && "fill-current text-destructive")} />
          </button>

          {inStock && (
            <button
              type="button"
              onClick={(event) => quickAction(event, "/api/backend/cart", cartStatus, setCartStatus)}
              aria-label={t("product.addToCart")}
              className="absolute top-13 z-10 flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:text-gold-600 rtl:left-3 ltr:right-3"
            >
              <ShoppingBag className={cn("size-4", cartStatus === "done" && "text-gold-600")} />
            </button>
          )}

          <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center bg-background/70 py-4 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              {t("viewProduct")}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-heading text-xl text-foreground">{productName(product, locale)}</h3>
          {description && <p className="mt-1 truncate text-sm text-muted-foreground">{description}</p>}
          <div className="mt-auto flex items-center gap-2 pt-4 text-sm font-medium">
            <span className="text-gold-600">{Number(product.price).toFixed(2)}</span>
            {discounted && (
              <span className="text-muted-foreground line-through">
                {Number(product.compareAtPrice).toFixed(2)}
              </span>
            )}
          </div>
          {lowStock && (
            <span className="mt-1 text-xs text-destructive">
              {t("onlyLeft", { count: product.stockQuantity })}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
