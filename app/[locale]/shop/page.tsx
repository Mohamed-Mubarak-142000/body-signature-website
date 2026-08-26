import { Filter, PackageSearch } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { ProductCard } from "@/components/sections/ProductCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { ShopPagination } from "@/components/sections/ShopPagination";
import { ShopPriceFilter } from "@/components/sections/ShopPriceFilter";
import { ShopSearchInput } from "@/components/sections/ShopSearchInput";
import { ShopSortSelect } from "@/components/sections/ShopSortSelect";
import { backendFetch } from "@/lib/backend";
import { buildShopQuery, SORT_OPTIONS, type ShopFilters, type SortOption } from "@/lib/shop-query";
import { categoryName, productName, type Category, type Product } from "@/lib/shop-types";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shop");
  return { title: t("title"), description: t("subtitle") };
}

async function getProducts(): Promise<Product[]> {
  const res = await backendFetch("/api/products");
  if (!res.ok) return [];
  return res.json();
}

async function getCategories(): Promise<Category[]> {
  const res = await backendFetch("/api/categories");
  if (!res.ok) return [];
  return res.json();
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}) {
  const t = await getTranslations("shop");
  const locale = await getLocale();
  const { category: activeCategory, q, sort, minPrice, maxPrice, page: pageParam } = await searchParams;
  const activeSort: SortOption = (SORT_OPTIONS as readonly string[]).includes(sort ?? "")
    ? (sort as SortOption)
    : "newest";
  const query = q?.trim() ?? "";

  const filters: ShopFilters = {
    category: activeCategory,
    q: query || undefined,
    sort: activeSort,
    minPrice,
    maxPrice,
  };

  const min = minPrice ? Number(minPrice) : undefined;
  const max = maxPrice ? Number(maxPrice) : undefined;

  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  let filtered = activeCategory
    ? products.filter((product) => product.category?.slug === activeCategory)
    : products;

  if (query) {
    const needle = query.toLowerCase();
    filtered = filtered.filter((product) =>
      product.translations.some((translation) => translation.name.toLowerCase().includes(needle)),
    );
  }

  if (min !== undefined && !Number.isNaN(min)) {
    filtered = filtered.filter((product) => Number(product.price) >= min);
  }
  if (max !== undefined && !Number.isNaN(max)) {
    filtered = filtered.filter((product) => Number(product.price) <= max);
  }

  filtered = [...filtered].sort((a, b) => {
    switch (activeSort) {
      case "price-asc":
        return Number(a.price) - Number(b.price);
      case "price-desc":
        return Number(b.price) - Number(a.price);
      case "name-asc":
        return productName(a, locale).localeCompare(productName(b, locale));
      default:
        return 0;
    }
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters = Boolean(activeCategory || query || minPrice || maxPrice);

  const filterPanel = (
    <>
      <ShopSearchInput filters={filters} />

      {categories.length > 0 && (
        <div>
          <h2 className="mb-4 font-heading text-lg text-foreground">{t("filterBy")}</h2>
          <nav className="flex flex-wrap gap-2 md:flex-col md:gap-1">
            <Link
              href={{ pathname: "/shop", query: buildShopQuery({ ...filters, category: undefined }) }}
              className={cn(
                "border px-4 py-1.5 text-sm font-medium transition-colors md:border-0 md:px-0 md:py-1",
                !activeCategory
                  ? "border-gold-500 bg-gold-100 text-gold-700 md:bg-transparent md:font-semibold md:text-gold-600"
                  : "border-border/70 text-muted-foreground hover:text-foreground",
              )}
            >
              {t("allCategories")}
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={{
                  pathname: "/shop",
                  query: buildShopQuery({ ...filters, category: category.slug }),
                }}
                className={cn(
                  "border px-4 py-1.5 text-sm font-medium transition-colors md:border-0 md:px-0 md:py-1",
                  activeCategory === category.slug
                    ? "border-gold-500 bg-gold-100 text-gold-700 md:bg-transparent md:font-semibold md:text-gold-600"
                    : "border-border/70 text-muted-foreground hover:text-foreground",
                )}
              >
                {categoryName(category, locale)}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <ShopPriceFilter filters={filters} />
    </>
  );

  return (
    <section className="mx-auto max-w-6xl px-6 pt-10 pb-20">
      <SectionHeader eyebrow={t("eyebrow")} subtitle={t("subtitle")} className="mb-10" />

      <div className="mb-8 flex items-center justify-between gap-4 md:justify-end">
        <Dialog>
          <DialogTrigger
            render={<Button variant="outline" size="sm" className="md:hidden" />}
          >
            <Filter className="size-3.5" />
            {t("filters")}
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] max-w-sm overflow-y-auto text-start">
            <DialogTitle>{t("filters")}</DialogTitle>
            <div className="mt-4 space-y-8">{filterPanel}</div>
          </DialogContent>
        </Dialog>

        <div className="flex items-center gap-4">
          <p className="text-sm whitespace-nowrap text-muted-foreground">
            {t("resultsCount", { count: filtered.length })}
          </p>
          <ShopSortSelect filters={filters} />
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-[240px_1fr]">
        <aside className="hidden space-y-8 md:sticky md:top-24 md:block md:self-start md:border-e md:border-border/70 md:pe-8">
          {filterPanel}
        </aside>

        <div>
          {paginated.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title={hasFilters ? t("noResults") : t("empty")}
              description={hasFilters ? t("noResultsDescription") : t("emptyDescription")}
            />
          ) : (
            <>
              <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {paginated.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {totalPages > 1 && (
                <ShopPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  buildHref={(page) => ({ pathname: "/shop", query: buildShopQuery({ ...filters, page }) })}
                  previousLabel={t("pagination.previous")}
                  nextLabel={t("pagination.next")}
                />
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
