"use client";

import Image from "next/image";
import { Camera, Star, PackageCheck, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ProductStatus } from "@/types";
import { StatusPill } from "@/components/admin/ui/Badge";

interface ProductLivePreviewProps {
  name: string;
  description: string;
  price: number;
  stock: number;
  status: ProductStatus;
  categoryLabel?: string;
  images: string[];
  tags: string[];
  featured?: boolean;
}

export function ProductLivePreview({
  name,
  description,
  price,
  stock,
  status,
  categoryLabel,
  images,
  tags,
  featured = false,
}: ProductLivePreviewProps) {
  const coverImage = images[0];

  return (
    <div className="sticky top-6 space-y-3">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">
        <span>Vista Previa en Tienda</span>
        <span className="text-xs font-normal text-[var(--dash-accent)]">
          Actualización en vivo
        </span>
      </div>

      <div className="rounded-2xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)] overflow-hidden shadow-lg transition-all duration-300">
        {/* Product Image Area */}
        <div className="relative aspect-square w-full bg-[var(--dash-surface-3)] overflow-hidden">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={name || "Producto"}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[var(--dash-muted)] gap-2">
              <Camera size={36} className="opacity-40" />
              <span className="text-xs">Sin fotos cargadas</span>
            </div>
          )}

          {/* Badges on preview */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {featured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--dash-accent)] text-[var(--dash-bg)] shadow-md">
                <Star size={11} fill="currentColor" />
                <span>Destacado</span>
              </span>
            )}
            <StatusPill type="stock" value={String(stock)} />
          </div>

          {images.length > 1 && (
            <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-xs">
              +{images.length - 1} foto{images.length > 2 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Product Info Area */}
        <div className="p-4 space-y-3">
          {categoryLabel && (
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--dash-accent)] block">
              {categoryLabel}
            </span>
          )}

          <h3 className="font-serif font-bold text-base text-[var(--dash-text)] line-clamp-2">
            {name.trim() || "Nombre del producto"}
          </h3>

          <p className="text-xs text-[var(--dash-muted)] line-clamp-2 leading-relaxed">
            {description.trim() || "Descripción corta del producto en la tienda..."}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-full text-xs bg-[var(--dash-surface-3)] text-[var(--dash-muted)] border border-[var(--dash-border)]"
                >
                  {t}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-xs text-[var(--dash-muted)] self-center">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Price & CTA simulation */}
          <div className="pt-3 border-t border-[var(--dash-border)] flex items-baseline justify-between">
            <div>
              <span className="text-xs text-[var(--dash-muted)] block">Precio</span>
              <span className="font-serif text-xl font-bold text-[var(--dash-text)]">
                {price > 0 ? formatPrice(price) : "$ —"}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--dash-accent)] text-[var(--dash-bg)] text-xs font-bold opacity-80">
              <ShoppingBag size={13} />
              <span>Comprar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductLivePreview;
