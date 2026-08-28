"use client";

import { Heart, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Link, useRouter } from "@/i18n/navigation";
import { useCurrencyFormatter } from "@/lib/currency-context";
import { hasDiscount, productName, type Product } from "@/lib/shop-types";

type WishlistItem = { id: string; productId: string; product: Product };

export function WishlistClient({ items }: { items: WishlistItem[] }) {
  const t = useTranslations("shop.wishlist");
  const tShop = useTranslations("shop");
  const locale = useLocale();
  const router = useRouter();
  const formatCurrency = useCurrencyFormatter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function removeItem(productId: string) {
    setBusyId(productId);
    await fetch(`/api/backend/wishlist/items/${productId}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title={t("empty")}
        description={t("emptyDescription")}
        action={
          <Button size="lg" className="mt-2" nativeButton={false} render={<Link href="/shop" />}>
            {t("browseCta")}
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const product = item.product;
        const image = product.images[0]?.url;
        const discounted = hasDiscount(product);

        return (
          <div key={item.id} className="group relative border border-border/70 bg-card">
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              disabled={busyId === item.productId}
              aria-label={t("remove")}
              className="absolute top-3 z-10 flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:text-destructive disabled:opacity-50 rtl:left-3 ltr:right-3"
            >
              <X className="size-4" />
            </button>
            <Link href={`/shop/${product.slug}`} className="flex flex-col">
              <div className="relative aspect-[4/5] shrink-0 overflow-hidden bg-gradient-to-br from-gold-200 to-gold-400">
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={productName(product, locale)}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                {product.stockQuantity <= 0 && (
                  <span className="absolute top-3 rtl:right-3 ltr:left-3 bg-background/90 px-2 py-1 text-xs font-medium text-foreground">
                    {tShop("outOfStock")}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-heading text-lg text-foreground">{productName(product, locale)}</h3>
                <div className="mt-auto flex items-center gap-2 pt-4 text-sm font-medium">
                  <span className="text-gold-600">{formatCurrency(product.price)}</span>
                  {discounted && (
                    <span className="text-muted-foreground line-through">
                      {formatCurrency(product.compareAtPrice!)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
