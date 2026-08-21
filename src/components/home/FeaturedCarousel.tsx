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

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

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

  if (products.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 lg:gap-6"
        style={{ scrollPaddingLeft: 4 }}
      >
        {products.map((product, i) => (
          <div
            key={product.id}
            data-carousel-item
            className="w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[30%]"
          >
            <ProductCard product={product} featured={i === 0} />
          </div>
        ))}
      </div>

      {/* Edge fades — hint there's more to scroll */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-pava-cream to-transparent transition-opacity duration-300 ${atStart ? "opacity-0" : "opacity-100"}`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-pava-cream to-transparent transition-opacity duration-300 ${atEnd ? "opacity-0" : "opacity-100"}`}
      />

      {/* Controls */}
      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          disabled={atStart}
          aria-label="Productos anteriores"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-pava-brown/15 text-pava-brown transition-colors hover:border-pava-green hover:text-pava-green disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          disabled={atEnd}
          aria-label="Siguientes productos"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-pava-brown/15 text-pava-brown transition-colors hover:border-pava-green hover:text-pava-green disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
