"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";

import { NewArrivalProductCard } from "@/components/sections/NewArrivalProductCard";
import type { Product } from "@/lib/shop-types";

const AUTOPLAY_INTERVAL_MS = 4000;
const RESYNC_DEBOUNCE_MS = 150;

export function NewArrivalsSlider({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const indexRef = useRef(1);
  const count = products.length;
  const loop = count > 1;

  // A cloned last-card up front and a cloned first-card at the end let the
  // track scroll one step past either real edge; resync() below then jumps
  // (no animation) from that clone to its real twin, so looping never shows
  // the "snap back to the start" reset it used to.
  const slides = loop ? [products[count - 1], ...products, products[0]] : products;

  function scrollToIndex(index: number, smooth: boolean) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[index] as HTMLElement | undefined;
    if (!card) return;
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: smooth ? "smooth" : "auto" });
  }

  function step(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const rtl = getComputedStyle(track).direction === "rtl";
    indexRef.current += rtl ? -direction : direction;
    scrollToIndex(indexRef.current, true);
  }

  useEffect(() => {
    if (loop) scrollToIndex(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !loop) return;

    let timeout: number;
    function resync() {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        if (!track) return;
        let closest = 0;
        let minDistance = Infinity;
        for (let i = 0; i < track.children.length; i++) {
          const child = track.children[i] as HTMLElement;
          const distance = Math.abs(child.offsetLeft - track.offsetLeft - track.scrollLeft);
          if (distance < minDistance) {
            minDistance = distance;
            closest = i;
          }
        }
        indexRef.current = closest;
        if (closest === 0) {
          indexRef.current = count;
          scrollToIndex(count, false);
        } else if (closest === count + 1) {
          indexRef.current = 1;
          scrollToIndex(1, false);
        }
      }, RESYNC_DEBOUNCE_MS);
    }

    track.addEventListener("scroll", resync, { passive: true });
    return () => {
      track.removeEventListener("scroll", resync);
      window.clearTimeout(timeout);
    };
  }, [loop, count]);

  useEffect(() => {
    if (!loop) return;
    const id = window.setInterval(() => {
      if (!pausedRef.current) step(1);
    }, AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loop]);

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
        {slides.map((product, i) => (
          <div key={`${product.id}-${i}`} className="w-full shrink-0 snap-start sm:w-auto">
            <NewArrivalProductCard product={product} />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => step(-1)}
            className="absolute top-1/2 hidden -translate-y-1/2 rounded-full border border-border/70 bg-card p-2 text-foreground shadow-sm hover:bg-muted sm:flex rtl:-right-4 rtl:rotate-180 ltr:-left-4"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => step(1)}
            className="absolute top-1/2 hidden -translate-y-1/2 rounded-full border border-border/70 bg-card p-2 text-foreground shadow-sm hover:bg-muted sm:flex rtl:-left-4 rtl:rotate-180 ltr:-right-4"
          >
            <ChevronRight className="size-4" />
          </button>
        </>
      )}
    </div>
  );
}
