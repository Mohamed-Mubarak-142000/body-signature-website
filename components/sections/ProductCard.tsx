"use client";

import { ArrowRight, Heart, Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { MouseEvent } from "react";

import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-context";
import {
  LOW_STOCK_THRESHOLD,
  hasDiscount,
  productDescription,
  productName,
  type Product,
} from "@/lib/shop-types";
import { useWishlist } from "@/lib/wishlist-context";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const locale = useLocale();
  const t = useTranslations("shop");
  const cart = useCart();
  const wishlist = useWishlist();

  const image = product.images[0]?.url;
  const inStock = product.stockQuantity > 0;
  const lowStock = inStock && product.stockQuantity <= LOW_STOCK_THRESHOLD;
  const discounted = hasDiscount(product);
  const description = productDescription(product, locale);

  const line = cart.getLine(product.id);
  const cartBusy = cart.isPending(product.id);
  const wishlistBusy = wishlist.isPending(product.id);
  const saved = wishlist.has(product.id);

  function stop(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <div className="h-full min-w-0">
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
            onClick={(event) => {
              stop(event);
              wishlist.toggle(product.id);
            }}
            aria-label={t("product.addToWishlist")}
            disabled={wishlistBusy}
            className="absolute top-3 z-10 flex size-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:text-destructive disabled:opacity-70 rtl:left-3 ltr:right-3"
          >
            {wishlistBusy ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Heart className={cn("size-5", saved && "fill-current text-destructive")} />
            )}
          </button>

          {inStock &&
            (line ? (
              <div
                className="absolute top-16 z-10 flex items-center gap-0.5 rounded-full bg-primary px-1 py-1 text-primary-foreground shadow-sm rtl:left-3 ltr:right-3"
                onClick={stop}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    stop(event);
                    cart.setQuantity(product.id, line.quantity - 1);
                  }}
                  aria-label={t("product.decreaseQuantity")}
                  disabled={cartBusy}
                  className="flex size-7 items-center justify-center rounded-full transition-colors hover:bg-white/20 disabled:opacity-60"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="min-w-3 text-center text-xs font-semibold tabular-nums">
                  {line.quantity}
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    stop(event);
                    cart.setQuantity(product.id, line.quantity + 1);
                  }}
                  aria-label={t("product.increaseQuantity")}
                  disabled={cartBusy}
                  className="flex size-7 items-center justify-center rounded-full transition-colors hover:bg-white/20 disabled:opacity-60"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(event) => {
                  stop(event);
                  cart.addToCart(product.id);
                }}
                aria-label={t("product.addToCart")}
                disabled={cartBusy}
                className="absolute top-16 z-10 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-70 rtl:left-3 ltr:right-3"
              >
                {cartBusy ? <Loader2 className="size-5 animate-spin" /> : <ShoppingBag className="size-5" />}
              </button>
            ))}

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
