"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { buildShopQuery, type ShopFilters } from "@/lib/shop-query";

export function ShopSearchInput({ filters }: { filters: ShopFilters }) {
  const t = useTranslations("shop");
  const router = useRouter();
  const [value, setValue] = useState(filters.q ?? "");

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    router.push({ pathname: "/shop", query: buildShopQuery({ ...filters, q: value.trim() }) });
  }

  return (
    <form onSubmit={onSubmit} className="relative">
      <Search className="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground rtl:right-3 ltr:left-3" />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={t("searchPlaceholder")}
        className="w-full border border-border/70 bg-background py-2 text-sm focus:border-gold-500 focus:outline-none rtl:pr-9 rtl:pl-3 ltr:pl-9 ltr:pr-3"
      />
    </form>
  );
}
