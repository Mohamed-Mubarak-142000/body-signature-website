"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { NewArrivalProductCard } from "@/components/sections/NewArrivalProductCard";
import type { Product } from "@/lib/shop-types";

// Below this, one full-width card is shown per "page"; at/above it, several
// narrower cards peek side by side (matches the sm: breakpoint on the card).
const DESKTOP_QUERY = "(min-width: 640px)";
const MOBILE_AUTOPLAY_INTERVAL_MS = 1000;
const DESKTOP_AUTOPLAY_INTERVAL_MS = 3500;

export function NewArrivalsSlider({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia(DESKTOP_QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const onChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const scrollByAmount = useCallback(
    (direction: 1 | -1) => {
      const track = trackRef.current;
      if (!track) return;
      // On mobile each card fills the track, so one full clientWidth = one card.
      const amount = isDesktop ? track.clientWidth * 0.8 : track.clientWidth;
      track.scrollBy({ left: direction * amount, behavior: "smooth" });
    },
    [isDesktop],
  );

  useEffect(() => {
    if (products.length <= 1) return;

    const id = window.setInterval(
      () => {
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
      },
      isDesktop ? DESKTOP_AUTOPLAY_INTERVAL_MS : MOBILE_AUTOPLAY_INTERVAL_MS,
    );

    return () => window.clearInterval(id);
  }, [products.length, isDesktop, scrollByAmount]);

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
          <div key={product.id} className="w-full shrink-0 snap-start sm:w-auto">
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
