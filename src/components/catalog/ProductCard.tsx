"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Heart } from "lucide-react";
import { Product } from "@/types";
import {
  formatPrice,
  getCategoryLabel,
  LOW_STOCK_THRESHOLD,
  trackSpotlight,
  truncate,
  unitPrice,
} from "@/lib/utils";
import { useFavorites } from "@/context/FavoritesContext";
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
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  const isOutOfStock = product.status === "out_of_stock";
  const isFeatured = product.status === "featured";
  const isLowStock =
    !isOutOfStock && product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;
  const perUnit = unitPrice(product.price, product.weight);

  if (view === "list") {
    return (
      <article className="group flex gap-4 rounded-card border border-pava-brown/8 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] sm:p-5">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-control">
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
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <Badge variant="category">
                  {getCategoryLabel(product.category)}
                </Badge>
                {isFeatured && <Badge variant="featured">Destacado</Badge>}
                {isLowStock && (
                  <Badge variant="low_stock">
                    Últimas {product.stock} unidades
                  </Badge>
                )}
              </div>
              <button
                onClick={() => toggleFavorite(product.id)}
                aria-label={
                  favorite
                    ? `Quitar ${product.name} de favoritos`
                    : `Agregar ${product.name} a favoritos`
                }
                aria-pressed={favorite}
                className="shrink-0 text-pava-brown/40 hover:text-pava-terracotta transition-colors"
              >
                <Heart
                  size={18}
                  className={
                    favorite ? "fill-pava-terracotta text-pava-terracotta" : ""
                  }
                />
              </button>
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
            <span>
              <span className="font-display text-lg font-bold text-pava-green block">
                {formatPrice(product.price)}
              </span>
              {perUnit && (
                <span className="text-[11px] text-pava-brown-mid/60">
                  {perUnit}
                </span>
              )}
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
    <article
      onMouseMove={trackSpotlight}
      className="product-card group relative overflow-hidden rounded-card border border-pava-brown/8 bg-white transition-all duration-350 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
    >
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
        {!isOutOfStock && (isFeatured || isLowStock) && (
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {isFeatured && <Badge variant="featured">Destacado</Badge>}
            {isLowStock && (
              <Badge variant="low_stock">
                Últimas {product.stock} unidades
              </Badge>
            )}
          </div>
        )}

        {/* Favorite + quick view triggers */}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            onClick={() => toggleFavorite(product.id)}
            aria-label={
              favorite
                ? `Quitar ${product.name} de favoritos`
                : `Agregar ${product.name} a favoritos`
            }
            aria-pressed={favorite}
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-pava-gold ${
              favorite
                ? "text-pava-terracotta opacity-100"
                : "text-pava-brown opacity-0 group-hover:opacity-100"
            }`}
          >
            <Heart
              size={14}
              className={favorite ? "fill-pava-terracotta" : ""}
            />
          </button>
          <button
            onClick={() => setQuickViewOpen(true)}
            aria-label={`Vista rápida de ${product.name}`}
            className="flex h-8 w-8 items-center justify-center bg-white/90 text-pava-brown opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-pava-gold hover:text-pava-brown group-hover:opacity-100"
          >
            <Eye size={14} />
          </button>
        </div>
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-pava-brown/55">
            <span className="rounded-control bg-pava-cream px-4 py-2 text-xs font-semibold uppercase tracking-wider text-pava-brown">
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
          <span className="shrink-0 text-right">
            <span className="font-display block text-lg font-bold leading-none text-pava-green">
              {formatPrice(product.price)}
            </span>
            {perUnit && (
              <span className="mt-1 block text-[11px] text-pava-brown-mid/60">
                {perUnit}
              </span>
            )}
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
