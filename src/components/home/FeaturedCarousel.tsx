"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types";
import ProductCard from "@/components/catalog/ProductCard";

interface FeaturedCarouselProps {
  products: Product[];
}

export default function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
    
    // Calculate approximate active card index for indicator
    const card = el.querySelector<HTMLElement>("[data-carousel-item]");
    if (card) {
      const step = card.offsetWidth + 20;
      const idx = Math.round(el.scrollLeft / step);
      setActiveIndex(Math.min(products.length - 1, Math.max(0, idx)));
    }
  }, [products.length]);

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges]);

  function scrollByCard(direction: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-item]");
    const step = (card?.offsetWidth ?? 320) + 24;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  }

  function scrollToIndex(idx: number) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-item]");
    const step = (card?.offsetWidth ?? 320) + 24;
    el.scrollTo({ left: step * idx, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 pt-1 lg:gap-6"
        style={{ scrollPaddingLeft: 4 }}
      >
        {products.map((product, i) => (
          <div
            key={product.id}
            data-carousel-item
            className="w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[30%] transition-transform duration-300"
          >
            <ProductCard product={product} featured={i === 0} />
          </div>
        ))}
      </div>

      {/* Edge fades — hint there's more to scroll */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-pava-cream to-transparent transition-opacity duration-300 ${atStart ? "opacity-0" : "opacity-100"}`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-pava-cream to-transparent transition-opacity duration-300 ${atEnd ? "opacity-0" : "opacity-100"}`}
      />

      {/* Controls & Progress bar */}
      <div className="mt-8 flex items-center justify-between gap-4">
        {/* Progress dots */}
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {products.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`Ir al producto ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === i
                  ? "w-6 bg-pava-green"
                  : "w-1.5 bg-pava-brown/20 hover:bg-pava-brown/40"
              }`}
            />
          ))}
        </div>

        {/* Arrow buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={atStart}
            aria-label="Productos anteriores"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-pava-brown/15 bg-white text-pava-brown shadow-sm transition-all duration-200 hover:border-pava-green hover:bg-pava-green hover:text-pava-cream active:scale-95 disabled:pointer-events-none disabled:opacity-25"
          >
            <ChevronLeft size={19} />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={atEnd}
            aria-label="Siguientes productos"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-pava-brown/15 bg-white text-pava-brown shadow-sm transition-all duration-200 hover:border-pava-green hover:bg-pava-green hover:text-pava-cream active:scale-95 disabled:pointer-events-none disabled:opacity-25"
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </div>
    </div>
  );
}
