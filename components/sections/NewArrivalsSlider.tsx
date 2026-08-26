"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";

import { NewArrivalProductCard } from "@/components/sections/NewArrivalProductCard";
import type { Product } from "@/lib/shop-types";

const AUTOPLAY_INTERVAL_MS = 3500;

export function NewArrivalsSlider({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  function scrollByAmount(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  }

  useEffect(() => {
    if (products.length <= 1) return;

    const id = window.setInterval(() => {
      const track = trackRef.current;
      if (!track || pausedRef.current) return;

      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
      const atStart = track.scrollLeft <= 0;
      const rtl = getComputedStyle(track).direction === "rtl";
      const finished = rtl ? atStart : atEnd;

      if (finished) {
        track.scrollTo({ left: rtl ? track.scrollWidth : 0, behavior: "smooth" });
      } else {
        scrollByAmount(1);
      }
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [products.length]);

  return (
    <div
      className="relative"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onTouchStart={() => (pausedRef.current = true)}
      onTouchEnd={() => (pausedRef.current = false)}
    >
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div key={product.id} className="snap-start">
            <NewArrivalProductCard product={product} />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous"
        onClick={() => scrollByAmount(-1)}
        className="absolute top-1/2 hidden -translate-y-1/2 rounded-full border border-border/70 bg-card p-2 text-foreground shadow-sm hover:bg-muted sm:flex rtl:-right-4 rtl:rotate-180 ltr:-left-4"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => scrollByAmount(1)}
        className="absolute top-1/2 hidden -translate-y-1/2 rounded-full border border-border/70 bg-card p-2 text-foreground shadow-sm hover:bg-muted sm:flex rtl:-left-4 rtl:rotate-180 ltr:-right-4"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
