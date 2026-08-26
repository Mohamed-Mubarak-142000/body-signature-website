import { getTranslations } from "next-intl/server";

import { CTASection } from "@/components/sections/CTASection";
import { Hero } from "@/components/sections/Hero";
import { HighlightsBar } from "@/components/sections/HighlightsBar";
import { HomeIntro } from "@/components/sections/HomeIntro";
import { NewArrivalsSlider } from "@/components/sections/NewArrivalsSlider";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { aestheticMenServices, aestheticWomenServices } from "@/content/services";
import { backendFetch } from "@/lib/backend";
import type { Product } from "@/lib/shop-types";

const NEW_ARRIVALS_COUNT = 10;

async function getNewestProducts(): Promise<Product[]> {
  const res = await backendFetch("/api/products");
  if (!res.ok) return [];
  const products: Product[] = await res.json();
  // The backend already orders active products by createdAt desc.
  return products.slice(0, NEW_ARRIVALS_COUNT);
}

export default async function HomePage() {
  const t = await getTranslations("home");
  const tServices = await getTranslations("services");
  const newArrivals = await getNewestProducts();

  return (
    <>
      <Hero />
      <HighlightsBar />
      <HomeIntro />

      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeader
            eyebrow={t("newArrivalsEyebrow")}
            title={t("newArrivalsTitle")}
            subtitle={t("newArrivalsSubtitle")}
            align="center"
            className="mb-14"
          />
          <NewArrivalsSlider products={newArrivals} />
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeader
          eyebrow={t("servicesEyebrow")}
          title={t("servicesTitle")}
          subtitle={t("servicesSubtitle")}
          align="center"
          className="mb-14"
        />
        <ServicesGrid />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeader
          eyebrow={tServices("aestheticWomenEyebrow")}
          title={tServices("aestheticWomenTitle")}
          subtitle={tServices("aestheticWomenSubtitle")}
          align="center"
          className="mb-14"
        />
        <ServicesGrid services={aestheticWomenServices} />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeader
          eyebrow={tServices("aestheticMenEyebrow")}
          title={tServices("aestheticMenTitle")}
          subtitle={tServices("aestheticMenSubtitle")}
          align="center"
          className="mb-14"
        />
        <ServicesGrid services={aestheticMenServices} />
      </section>

      <CTASection
        title={t("ctaTitle")}
        body={t("ctaBody")}
        buttonLabel={t("ctaButton")}
      />
    </>
  );
}
