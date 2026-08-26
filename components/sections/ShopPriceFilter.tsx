"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { buildShopQuery, type ShopFilters } from "@/lib/shop-query";

export function ShopPriceFilter({ filters }: { filters: ShopFilters }) {
  const t = useTranslations("shop");
  const router = useRouter();
  const [min, setMin] = useState(filters.minPrice ?? "");
  const [max, setMax] = useState(filters.maxPrice ?? "");

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    router.push({
      pathname: "/shop",
      query: buildShopQuery({ ...filters, minPrice: min.trim(), maxPrice: max.trim() }),
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <h2 className="font-heading text-lg text-foreground">{t("priceFilter.label")}</h2>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          inputMode="decimal"
          value={min}
          onChange={(event) => setMin(event.target.value)}
          placeholder={t("priceFilter.min")}
          aria-label={t("priceFilter.min")}
          className="w-full min-w-0 border border-border/70 bg-background px-3 py-2 text-sm focus:border-gold-500 focus:outline-none"
        />
        <span className="text-muted-foreground">–</span>
        <input
          type="number"
          min={0}
          inputMode="decimal"
          value={max}
          onChange={(event) => setMax(event.target.value)}
          placeholder={t("priceFilter.max")}
          aria-label={t("priceFilter.max")}
          className="w-full min-w-0 border border-border/70 bg-background px-3 py-2 text-sm focus:border-gold-500 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="w-full border border-border/70 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        {t("priceFilter.apply")}
      </button>
    </form>
  );
}
