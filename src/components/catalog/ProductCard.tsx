"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, getCategoryLabel, truncate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import AddToCartButton from "./AddToCartButton";
import QuickViewModal from "./QuickViewModal";

interface ProductCardProps {
  product: Product;
  view?: "grid" | "list";
  featured?: boolean;
}

export default function ProductCard({
  product,
  view = "grid",
  featured = false,
}: ProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const isOutOfStock = product.status === "out_of_stock";
  const isFeatured = product.status === "featured";

  if (view === "list") {
    return (
      <article className="group flex gap-4 border border-pava-brown/8 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] sm:p-5">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="96px"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-pava-brown/50 flex items-center justify-center">
              <span className="text-[10px] text-white font-semibold">
                Agotado
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="category">
                {getCategoryLabel(product.category)}
              </Badge>
              {isFeatured && <Badge variant="featured">Destacado</Badge>}
            </div>
            <Link href={`/producto/${product.id}`}>
              <h3 className="font-medium text-pava-brown hover:text-pava-green transition-colors leading-tight">
                {product.name}
              </h3>
            </Link>
            <p className="text-xs text-pava-brown-mid/70 mt-1">
              {truncate(product.description, 80)}
            </p>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="font-display text-lg font-bold text-pava-green">
              {formatPrice(product.price)}
            </span>
            <div className="w-32">
              <AddToCartButton
                product={product}
                disabled={isOutOfStock}
                size="sm"
              />
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Grid view — with premium hover states
  const imageAspect = featured ? "aspect-[4/3]" : "aspect-[5/4]";

  return (
    <article className="product-card group relative border border-pava-brown/8 bg-white transition-all duration-350 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]">
      <span className="product-card-glow" aria-hidden="true" />
      {/* Image area */}
      <div
        className={`relative ${imageAspect} overflow-hidden bg-pava-cream-dark`}
      >
        <Link
          href={`/producto/${product.id}`}
          aria-label={`Ver ${product.name}`}
          tabIndex={-1}
          className="relative block h-full w-full"
        >
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            sizes={
              featured
                ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 42vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
          />
        </Link>

        {/* Badges */}
        {isFeatured && !isOutOfStock && (
          <div className="absolute left-3 top-3">
            <Badge variant="featured">Destacado</Badge>
          </div>
        )}

        {/* Quick view trigger */}
        <button
          onClick={() => setQuickViewOpen(true)}
          aria-label={`Vista rápida de ${product.name}`}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center bg-white/90 text-pava-brown opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-pava-gold hover:text-pava-brown group-hover:opacity-100"
        >
          <Eye size={14} />
        </button>
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-pava-brown/55">
            <span className="bg-pava-cream px-4 py-2 text-xs font-semibold uppercase tracking-wider text-pava-brown">
              Agotado
            </span>
          </div>
        )}

        {/* Hover overlay with quick-add — slides up from bottom */}
        {!isOutOfStock && (
          <div className="product-card-btn absolute inset-x-0 bottom-0 p-3">
            <AddToCartButton
              product={product}
              disabled={false}
              size="sm"
              overlay
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        <div className="mb-2 flex items-start justify-between gap-3">
          <Badge variant="category">{getCategoryLabel(product.category)}</Badge>
          <span className="font-display shrink-0 text-lg font-bold leading-none text-pava-green">
            {formatPrice(product.price)}
          </span>
        </div>

        <Link href={`/producto/${product.id}`}>
          <h3 className="font-display mb-1.5 text-[1.1rem] font-bold leading-tight text-pava-brown transition-colors hover:text-pava-green">
            {product.name}
          </h3>
        </Link>

        <p className="mb-5 min-h-9 text-[13px] leading-relaxed text-pava-brown-mid/70">
          {truncate(product.description, 72)}
        </p>

        {/* Desktop fallback button (always visible, not overlaid) */}
        <AddToCartButton product={product} disabled={isOutOfStock} />
      </div>

      {quickViewOpen && (
        <QuickViewModal
          product={product}
          onClose={() => setQuickViewOpen(false)}
        />
      )}
    </article>
  );
}
