import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { ProductActions } from "@/components/sections/ProductActions";
import { ProductCard } from "@/components/sections/ProductCard";
import { ProductImageGallery } from "@/components/sections/ProductImageGallery";
import { ReviewsSection, type Review } from "@/components/sections/ReviewsSection";
import { auth } from "@/lib/auth";
import { backendFetch } from "@/lib/backend";
import { formatCurrency } from "@/lib/currency";
import {
  LOW_STOCK_THRESHOLD,
  categoryName,
  hasDiscount,
  productDescription,
  productName,
  type Product,
} from "@/lib/shop-types";
import { Link } from "@/i18n/navigation";

async function getProduct(slug: string): Promise<Product | null> {
  const res = await backendFetch(`/api/products/slug/${slug}`);
  if (!res.ok) return null;
  return res.json();
}

async function getCurrency(): Promise<string> {
  const res = await backendFetch("/api/settings");
  if (!res.ok) return "EUR";
  const settings = await res.json();
  return settings.currency ?? "EUR";
}

async function getRelatedProducts(product: Product): Promise<Product[]> {
  const res = await backendFetch("/api/products");
  if (!res.ok) return [];
  const products: Product[] = await res.json();
  return products.filter((p) => p.id !== product.id && p.categoryId === product.categoryId).slice(0, 4);
}

async function getReviews(productId: string): Promise<{ reviews: Review[]; average: number; count: number }> {
  const res = await backendFetch(`/api/products/${productId}/reviews`);
  if (!res.ok) return { reviews: [], average: 0, count: 0 };
  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const product = await getProduct(slug);
  if (!product) return {};
  return { title: productName(product, locale) };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const t = await getTranslations("shop");
  const locale = await getLocale();
  const session = await auth();
  const [related, { reviews, average, count }, currency] = await Promise.all([
    getRelatedProducts(product),
    getReviews(product.id),
    getCurrency(),
  ]);

  const images = product.images.map((img) => img.url);
  const inStock = product.stockQuantity > 0;
  const lowStock = inStock && product.stockQuantity <= LOW_STOCK_THRESHOLD;
  const discounted = hasDiscount(product);

  return (
    <section className="mx-auto max-w-6xl px-6 pt-10 pb-20">
      <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground">
        ← {t("product.backToShop")}
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2 md:items-start">
        <ProductImageGallery images={images} alt={productName(product, locale)} />

        <div>
          <h1 className="font-heading text-3xl text-foreground md:text-4xl">
            {productName(product, locale)}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <p className="text-xl font-medium text-gold-600">{formatCurrency(product.price, currency, locale)}</p>
            {discounted && (
              <p className="text-base text-muted-foreground line-through">
                {formatCurrency(product.compareAtPrice!, currency, locale)}
              </p>
            )}
          </div>
          {!inStock && <p className="mt-2 text-sm text-destructive">{t("outOfStock")}</p>}
          {lowStock && (
            <p className="mt-2 text-sm text-destructive">{t("onlyLeft", { count: product.stockQuantity })}</p>
          )}

          {productDescription(product, locale) && (
            <p className="mt-6 text-base text-muted-foreground">
              {productDescription(product, locale)}
            </p>
          )}

          <div className="mt-8">
            <ProductActions productId={product.id} inStock={inStock} />
          </div>

          <dl className="mt-8 space-y-2 border-t border-border/70 pt-6 text-sm">
            {product.category && (
              <div className="flex gap-2">
                <dt className="text-muted-foreground">{t("product.category")}</dt>
                <dd className="text-foreground">{categoryName(product.category, locale)}</dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="text-muted-foreground">{t("product.sku")}</dt>
              <dd className="text-foreground">{product.sku}</dd>
            </div>
          </dl>

          {product.variants.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-foreground">{t("product.options")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <span
                    key={variant.id}
                    className="border border-border/70 px-3 py-1 text-xs text-muted-foreground"
                  >
                    {variant.attribute}: {variant.value}
                    {Number(variant.priceModifier) !== 0 &&
                      ` (${Number(variant.priceModifier) > 0 ? "+" : ""}${formatCurrency(variant.priceModifier, currency, locale)})`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20 border-t border-border/70 pt-14">
          <h2 className="font-heading text-2xl text-foreground">{t("relatedProducts")}</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-20 border-t border-border/70 pt-14">
        <ReviewsSection
          productId={product.id}
          reviews={reviews}
          average={average}
          count={count}
          isSignedIn={Boolean(session?.user)}
        />
      </div>
    </section>
  );
}
