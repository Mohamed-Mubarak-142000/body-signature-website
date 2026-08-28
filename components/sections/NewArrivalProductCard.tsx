"use client";

import { Heart, Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { MouseEvent } from "react";

import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-context";
import { useCurrencyFormatter } from "@/lib/currency-context";
import { LOW_STOCK_THRESHOLD, hasDiscount, productName, type Product } from "@/lib/shop-types";
import { useWishlist } from "@/lib/wishlist-context";
import { cn } from "@/lib/utils";

export function NewArrivalProductCard({ product }: { product: Product }) {
  const locale = useLocale();
  const t = useTranslations("shop");
  const cart = useCart();
  const wishlist = useWishlist();
  const formatCurrency = useCurrencyFormatter();

  const image = product.images[0]?.url;
  const inStock = product.stockQuantity > 0;
  const lowStock = inStock && product.stockQuantity <= LOW_STOCK_THRESHOLD;
  const discounted = hasDiscount(product);

  const line = cart.getLine(product.id);
  const cartBusy = cart.isPending(product.id);
  const wishlistBusy = wishlist.isPending(product.id);
  const saved = wishlist.has(product.id);

  function stop(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <Link href={`/shop/${product.slug}`} className="group flex h-full w-full shrink-0 flex-col items-center text-center sm:w-48">
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
          <span className="text-gold-600">{formatCurrency(product.price)}</span>
          {discounted && (
            <span className="text-muted-foreground line-through">
              {formatCurrency(product.compareAtPrice!)}
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
          onClick={(event) => {
            stop(event);
            wishlist.toggle(product.id);
          }}
          aria-label={t("product.addToWishlist")}
          disabled={wishlistBusy}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-colors hover:text-destructive disabled:opacity-70"
        >
          {wishlistBusy ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Heart className={cn("size-5", saved && "fill-current text-destructive")} />
          )}
        </button>

        {inStock &&
          (line ? (
            <div className="flex h-10 min-w-0 flex-1 items-center justify-between rounded-full border border-gold-600/40 bg-gold-50 px-1 text-gold-700">
              <button
                type="button"
                onClick={(event) => {
                  stop(event);
                  cart.setQuantity(product.id, line.quantity - 1);
                }}
                aria-label={t("product.decreaseQuantity")}
                disabled={cartBusy}
                className="flex size-6 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-gold-100 disabled:opacity-60"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="text-xs font-semibold">{line.quantity}</span>
              <button
                type="button"
                onClick={(event) => {
                  stop(event);
                  cart.setQuantity(product.id, line.quantity + 1);
                }}
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
              onClick={(event) => {
                stop(event);
                cart.addToCart(product.id);
              }}
              aria-label={t("product.addToCart")}
              disabled={cartBusy}
              className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-full bg-gold-600 px-2 text-xs font-medium text-white transition-colors hover:bg-gold-700 disabled:opacity-70"
            >
              {cartBusy ? (
                <Loader2 className="size-3.5 shrink-0 animate-spin" />
              ) : (
                <ShoppingBag className="size-3.5 shrink-0" />
              )}
              <span className="truncate">{t("product.addToCart")}</span>
            </button>
          ))}
      </div>
    </Link>
  );
}
