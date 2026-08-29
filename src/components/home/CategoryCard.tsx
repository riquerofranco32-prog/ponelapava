"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { trackSpotlight } from "@/lib/utils";
import type { Category } from "@/types";

export default function CategoryCard({
  cat,
  featured = false,
}: {
  cat: Category;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/catalogo?cat=${cat.slug}`}
      aria-label={`Ver categoría ${cat.name}`}
      onMouseMove={trackSpotlight}
      className={`img-hover-zoom group relative block overflow-hidden rounded-2xl bg-pava-brown border border-pava-brown/20 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:border-pava-gold/40 ${
        featured
          ? "aspect-[16/10] sm:aspect-[3/4] lg:aspect-auto lg:h-full"
          : "aspect-[3/4]"
      }`}
    >
      {cat.image && (
        <Image
          src={cat.image}
          alt={cat.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          sizes={
            featured
              ? "(max-width: 640px) 90vw, (max-width: 1024px) 30vw, 32vw"
              : "(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 16vw"
          }
        />
      )}

      {/* Multi-layer gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/90" />
      
      {/* Top pill badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 border border-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-pava-cream backdrop-blur-md transition-all duration-300 group-hover:bg-pava-gold group-hover:text-pava-brown group-hover:border-pava-gold">
          {cat.icon && <span>{cat.icon}</span>}
          <span>{cat.name}</span>
        </span>
      </div>

      {/* Top right explore arrow icon */}
      <div className="absolute top-3 right-3 z-10">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/15 opacity-0 -translate-y-1 translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 group-hover:bg-pava-gold group-hover:text-pava-brown group-hover:border-pava-gold">
          <ArrowUpRight size={14} strokeWidth={2.5} />
        </span>
      </div>

      {/* Spotlight overlay on hover */}
      <div
        aria-hidden="true"
        className="spotlight-overlay absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* Bottom label */}
      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4 sm:p-5 ${featured ? "lg:p-6" : ""}`}
      >
        <span
          className={`font-display font-bold uppercase tracking-[0.08em] text-white drop-shadow-md transition-transform duration-300 group-hover:-translate-y-0.5 ${
            featured ? "text-base sm:text-lg lg:text-xl" : "text-sm sm:text-base"
          }`}
        >
          {cat.name}
        </span>
        <span className="text-[11px] font-medium text-pava-gold/90 transition-opacity duration-300 flex items-center gap-1">
          <span>Explorar colección</span>
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}
