"use client";

import Link from "next/link";
import Image from "next/image";
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
      className={`img-hover-zoom group relative block overflow-hidden rounded-card bg-pava-brown ${
        featured
          ? "aspect-[16/10] sm:aspect-[3/4] lg:aspect-auto lg:h-full"
          : "aspect-[3/4]"
      }`}
    >
      {cat.image && (
        <Image
          src={cat.image}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          sizes={
            featured
              ? "(max-width: 640px) 90vw, (max-width: 1024px) 30vw, 32vw"
              : "(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 16vw"
          }
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-pava-brown/85 via-pava-brown/10 to-transparent transition-colors duration-300 group-hover:from-pava-brown/90" />
      <div
        aria-hidden="true"
        className="spotlight-overlay absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4 sm:p-5 ${featured ? "lg:p-7" : ""}`}
      >
        <div className="flex items-center justify-between gap-2">
          {cat.icon && (
            <span
              className={`leading-none transition-transform duration-300 group-hover:-translate-y-1 ${featured ? "text-3xl lg:text-4xl" : "text-xl sm:text-2xl"}`}
              aria-hidden="true"
            >
              {cat.icon}
            </span>
          )}
          <span className="opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-pava-gold text-xs font-bold">
            Ver →
          </span>
        </div>
        <span
          className={`font-display font-bold uppercase tracking-[0.1em] text-pava-cream drop-shadow-sm ${
            featured ? "text-sm sm:text-base lg:text-lg" : "text-xs sm:text-sm"
          }`}
        >
          {cat.name}
        </span>
      </div>
    </Link>
  );
}
