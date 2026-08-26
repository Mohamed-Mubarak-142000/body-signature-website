"use client";

import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { buildShopQuery, SORT_OPTIONS, type ShopFilters, type SortOption } from "@/lib/shop-query";

const SORT_LABEL_KEYS: Record<SortOption, string> = {
  newest: "newest",
  "price-asc": "priceAsc",
  "price-desc": "priceDesc",
  "name-asc": "nameAsc",
};

export function ShopSortSelect({ filters }: { filters: ShopFilters }) {
  const t = useTranslations("shop");
  const router = useRouter();

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    router.push({
      pathname: "/shop",
      query: buildShopQuery({ ...filters, sort: event.target.value as SortOption }),
    });
  }

  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="hidden sm:inline">{t("sort.label")}</span>
      <select
        value={filters.sort ?? "newest"}
        onChange={onChange}
        className="border border-border/70 bg-background px-3 py-2 text-sm text-foreground focus:border-gold-500 focus:outline-none"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {t(`sort.${SORT_LABEL_KEYS[option]}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
