"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { X, MessageCircle } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, getCategoryLabel } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import AddToCartButton from "@/components/catalog/AddToCartButton";
import { useSiteSettings } from "@/context/SiteSettingsContext";

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export default function QuickViewModal({
  product,
  onClose,
}: QuickViewModalProps) {
  const settings = useSiteSettings();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = "hidden";

    function getFocusable(): HTMLElement[] {
      return Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => !el.hasAttribute("disabled"));
    }

    getFocusable()[0]?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, []);

  const isOutOfStock = product.status === "out_of_stock";
  const isFeatured = product.status === "featured";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-pava-brown/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className="grid max-h-[90vh] w-full max-w-3xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-2xl border border-pava-brown/10 sm:grid-cols-2"
      >
        <div className="relative aspect-square shrink-0 bg-pava-cream-dark sm:aspect-auto">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-pava-brown/55">
              <span className="bg-pava-cream px-4 py-2 text-xs font-semibold uppercase tracking-wider text-pava-brown">
                Agotado
              </span>
            </div>
          )}
        </div>

        <div className="relative flex flex-col p-6 sm:p-8">
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center text-pava-brown/40 transition-colors hover:text-pava-brown"
          >
            <X size={18} />
          </button>

          <div className="mb-3 flex items-center gap-2">
            <Badge variant="category">
              {getCategoryLabel(product.category)}
            </Badge>
            {isFeatured && <Badge variant="featured">Destacado</Badge>}
          </div>

          <h2 className="font-display mb-2 text-2xl font-bold leading-tight text-pava-brown">
            {product.name}
          </h2>

          {/* Pricing & Transfer Discount */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-pava-green">
                {formatPrice(product.price)}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-chip bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                10% OFF: {formatPrice(Math.round(product.price * 0.9))} efvo/transf
              </span>
              <span className="text-[11px] text-pava-brown/60">
                3 cuotas de {formatPrice(Math.round(product.price / 3))}
              </span>
            </div>
          </div>

          <p className="mb-6 text-xs sm:text-sm leading-relaxed text-pava-brown-mid/75 line-clamp-3">
            {product.description}
          </p>

          {(product.brand || product.weight) && (
            <div className="mb-6 flex gap-6 border-t border-pava-brown/8 pt-3 text-xs text-pava-brown-mid/70">
              {product.brand && (
                <span>
                  <span className="block text-[10px] uppercase tracking-wide text-pava-brown-mid/50">
                    Marca
                  </span>
                  {product.brand}
                </span>
              )}
              {product.weight && (
                <span>
                  <span className="block text-[10px] uppercase tracking-wide text-pava-brown-mid/50">
                    Peso
                  </span>
                  {product.weight}
                </span>
              )}
            </div>
          )}

          <div className="mt-auto flex flex-col gap-2">
            <AddToCartButton
              product={product}
              disabled={isOutOfStock}
              size="md"
            />
            <div className="flex items-center justify-between pt-1 text-xs">
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(`¡Hola! Tengo una consulta sobre "${product.name}" (${formatPrice(product.price)}) de Poné La Pava 🧉`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                <MessageCircle size={13} />
                Consultar por WhatsApp
              </a>
              <Link
                href={`/producto/${product.id}`}
                onClick={onClose}
                className="font-semibold text-pava-brown/70 hover:text-pava-green transition-colors"
              >
                Ver ficha completa →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
