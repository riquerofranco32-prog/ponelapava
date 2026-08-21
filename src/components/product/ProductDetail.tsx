"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingBag,
  MessageCircle,
  ChevronLeft,
} from "lucide-react";
import { Product } from "@/types";
import { formatPrice, getCategoryLabel } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import Badge from "@/components/ui/Badge";
import ProductCard from "@/components/catalog/ProductCard";
import { whatsappChatUrl } from "@/lib/whatsapp";
import { useSiteSettings } from "@/context/SiteSettingsContext";

interface ProductDetailProps {
  product: Product;
  related: Product[];
}

export default function ProductDetail({
  product,
  related,
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const { addItem, setDrawer } = useCart();
  const settings = useSiteSettings();

  const isOutOfStock = product.status === "out_of_stock";

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setDrawer(true);
    }, 1200);
  };

  return (
    <div className="bg-pava-cream min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-pava-cream-dark border-b border-pava-brown/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pt-28 lg:pt-32">
          <nav
            className="flex items-center gap-2 text-sm text-pava-brown/50"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="shrink-0 hover:text-pava-green transition-colors"
            >
              Inicio
            </Link>
            <span className="shrink-0">/</span>
            <Link
              href="/catalogo"
              className="shrink-0 hover:text-pava-green transition-colors"
            >
              Catálogo
            </Link>
            <span className="shrink-0">/</span>
            <Link
              href={`/catalogo?cat=${product.category}`}
              className="shrink-0 hover:text-pava-green transition-colors"
            >
              {getCategoryLabel(product.category)}
            </Link>
            <span className="shrink-0">/</span>
            {/* min-w-0 lets this item shrink below its content width so
                truncate actually clamps it instead of overflowing the row */}
            <span className="min-w-0 flex-1 truncate text-pava-brown">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Product */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Images */}
          <div>
            {/* Main image */}
            <div className="relative aspect-square overflow-hidden rounded-card bg-white mb-3">
              <Image
                src={product.images[activeImage] ?? product.images[0]}
                alt={product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-pava-brown/50 flex items-center justify-center">
                  <span className="rounded-control bg-pava-cream text-pava-brown text-sm font-semibold tracking-wider uppercase px-6 py-3">
                    Agotado
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-16 h-16 shrink-0 overflow-hidden rounded-control border-2 transition-all ${
                      activeImage === i
                        ? "border-pava-green"
                        : "border-transparent hover:border-pava-brown/30"
                    }`}
                    aria-label={`Ver imagen ${i + 1}`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} — imagen ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {/* Category + status */}
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="category">
                {getCategoryLabel(product.category)}
              </Badge>
              {product.status === "featured" && (
                <Badge variant="featured">Destacado</Badge>
              )}
              {isOutOfStock && <Badge variant="out_of_stock">Sin stock</Badge>}
            </div>

            {/* Name */}
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-pava-brown leading-tight mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-4xl font-bold text-pava-green">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none mb-8 text-pava-brown-mid/80 leading-relaxed">
              <p>{product.longDescription ?? product.description}</p>
            </div>

            {/* Meta */}
            {(product.brand || product.weight) && (
              <div className="flex flex-wrap gap-6 py-5 border-t border-b border-pava-brown/10 mb-8">
                {product.brand && (
                  <div>
                    <span className="text-[10px] tracking-[0.15em] uppercase text-pava-brown/50 font-medium block mb-0.5">
                      Marca
                    </span>
                    <span className="text-sm font-medium text-pava-brown">
                      {product.brand}
                    </span>
                  </div>
                )}
                {product.weight && (
                  <div>
                    <span className="text-[10px] tracking-[0.15em] uppercase text-pava-brown/50 font-medium block mb-0.5">
                      Peso
                    </span>
                    <span className="text-sm font-medium text-pava-brown">
                      {product.weight}
                    </span>
                  </div>
                )}
                {product.tags && product.tags.length > 0 && (
                  <div>
                    <span className="text-[10px] tracking-[0.15em] uppercase text-pava-brown/50 font-medium block mb-0.5">
                      Tags
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs rounded-chip bg-pava-cream-dark text-pava-brown-mid px-2 py-0.5 border border-pava-brown/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity + Add to cart */}
            {!isOutOfStock ? (
              <div className="flex items-stretch gap-3 mb-4">
                {/* Quantity */}
                <div className="flex items-center overflow-hidden rounded-control border-2 border-pava-brown/15">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex items-center justify-center w-11 h-11 text-pava-brown hover:text-pava-green hover:bg-pava-cream-dark transition-colors"
                    aria-label="Reducir cantidad"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center text-sm font-medium text-pava-brown">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex items-center justify-center w-11 h-11 text-pava-brown hover:text-pava-green hover:bg-pava-cream-dark transition-colors"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Add to cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={added}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-control px-6 py-3 text-sm font-semibold tracking-wide border-2 transition-all duration-200 active:scale-[0.98] ${
                    added
                      ? "bg-pava-green text-pava-cream border-pava-green"
                      : "bg-pava-green text-pava-cream border-pava-green hover:bg-pava-green-light hover:border-pava-green-light"
                  }`}
                >
                  <ShoppingBag size={16} />
                  {added ? "¡Agregado!" : "Agregar al carrito"}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-control py-4 bg-pava-cream-dark border border-pava-brown/10 mb-4">
                <span className="text-sm text-pava-brown/60 font-medium">
                  Producto sin stock — consultanos por disponibilidad
                </span>
              </div>
            )}

            {/* WhatsApp */}
            <a
              href={whatsappChatUrl(
                settings.whatsappNumber,
                `Hola! Me interesa el producto: ${product.name} (${formatPrice(product.price)})`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-control py-3 bg-whatsapp text-white text-sm font-semibold border-2 border-whatsapp hover:bg-whatsapp-dark hover:border-whatsapp-dark transition-colors duration-200"
            >
              <MessageCircle size={16} />
              Consultar por WhatsApp
            </a>

            {/* Back */}
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 mt-8 text-sm text-pava-brown/50 hover:text-pava-green transition-colors"
            >
              <ChevronLeft size={15} />
              Volver al catálogo
            </Link>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20 lg:mt-28">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-px bg-pava-green" />
              <h2 className="font-display text-2xl lg:text-3xl font-bold text-pava-brown">
                También te puede gustar
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
