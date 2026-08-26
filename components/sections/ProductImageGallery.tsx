"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const AUTOPLAY_INTERVAL_MS = 3500;

export function ProductImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (images.length <= 1) return;

    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setActive((current) => (current + 1) % images.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [images.length]);

  return (
    <div
      className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gold-200 to-gold-400"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      {images.map((image, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={image + index}
          src={image}
          alt={alt}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
            index === active ? "opacity-100" : "opacity-0",
          )}
        />
      ))}

      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
          {images.map((image, index) => (
            <button
              key={image + index}
              type="button"
              aria-label={`${index + 1}`}
              onClick={() => setActive(index)}
              className={cn(
                "size-2 rounded-full transition-colors",
                index === active ? "bg-background" : "bg-background/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
