export const SORT_OPTIONS = ["newest", "price-asc", "price-desc", "name-asc"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export type ShopFilters = {
  category?: string;
  q?: string;
  sort?: SortOption;
  minPrice?: string;
  maxPrice?: string;
  page?: number;
};

export function buildShopQuery(filters: ShopFilters): Record<string, string> {
  const query: Record<string, string> = {};
  if (filters.category) query.category = filters.category;
  if (filters.q) query.q = filters.q;
  if (filters.sort && filters.sort !== "newest") query.sort = filters.sort;
  if (filters.minPrice) query.minPrice = filters.minPrice;
  if (filters.maxPrice) query.maxPrice = filters.maxPrice;
  if (filters.page && filters.page > 1) query.page = String(filters.page);
  return query;
}
