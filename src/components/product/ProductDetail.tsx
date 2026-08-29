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
  Heart,
  Share2,
  Check,
  Truck,
  Store,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { Product } from "@/types";
import { formatPrice, getCategoryLabel, unitPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import Badge from "@/components/ui/Badge";
import ProductCard from "@/components/catalog/ProductCard";
import { whatsappChatUrl } from "@/lib/whatsapp";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import ShippingCalculator from "@/components/product/ShippingCalculator";

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
  const [copiedLink, setCopiedLink] = useState(false);
  const [showCuradoSteps, setShowCuradoSteps] = useState(false);
  const { addItem, setDrawer } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  const settings = useSiteSettings();

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const shareData = {
      title: `${product.name} | Poné La Pava`,
      text: product.description,
      url: window.location.href,
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Ignore
    }
  };

  const isOutOfStock = product.status === "out_of_stock";
  const perUnit = unitPrice(product.price, product.weight);

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
            {/* Category + status + actions */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="category">
                  {getCategoryLabel(product.category)}
                </Badge>
                {product.status === "featured" && (
                  <Badge variant="featured">Destacado</Badge>
                )}
                {isOutOfStock && (
                  <Badge variant="out_of_stock">Sin stock</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  aria-label="Compartir producto"
                  className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full border border-pava-brown/15 text-pava-brown/60 hover:border-pava-green hover:text-pava-green transition-colors"
                  title="Compartir o copiar enlace"
                >
                  {copiedLink ? (
                    <Check size={16} className="text-pava-green" />
                  ) : (
                    <Share2 size={16} />
                  )}
                </button>
                <button
                  onClick={() => toggleFavorite(product.id)}
                  aria-label={
                    favorite
                      ? `Quitar ${product.name} de favoritos`
                      : `Agregar ${product.name} a favoritos`
                  }
                  aria-pressed={favorite}
                  className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full border border-pava-brown/15 text-pava-brown/60 hover:border-pava-terracotta hover:text-pava-terracotta transition-colors"
                >
                  <Heart
                    size={17}
                    className={
                      favorite ? "fill-pava-terracotta text-pava-terracotta" : ""
                    }
                  />
                </button>
              </div>
            </div>

            {/* Name */}
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-pava-brown leading-tight mb-4">
              {product.name}
            </h1>

            {/* Price & Payment Options */}
            <div className="mb-6 rounded-card bg-white border border-pava-brown/10 p-4.5 shadow-sm">
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-display text-3.5xl lg:text-4xl font-bold text-pava-green">
                    {formatPrice(product.price)}
                  </span>
                  {perUnit && (
                    <span className="text-xs text-pava-brown-mid/60 font-medium">({perUnit})</span>
                  )}
                </div>
              </div>

              {/* Transfer Discount Callout */}
              <div className="flex items-center gap-2 rounded-control bg-emerald-50 border border-emerald-200/80 px-3 py-2 text-xs text-emerald-900 mb-3">
                <span className="font-bold bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded tracking-wide uppercase">
                  10% OFF
                </span>
                <span className="font-medium">
                  <strong>{formatPrice(Math.round(product.price * 0.9))}</strong> pagando con Transferencia o Efectivo
                </span>
              </div>

              {/* Installments & Cards */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-pava-brown-mid/80 pt-1 border-t border-pava-brown/8">
                <span className="inline-flex items-center gap-1.5 font-semibold text-pava-brown">
                  <CreditCard size={13} className="text-pava-green" />
                  3 cuotas de {formatPrice(Math.round(product.price / 3))}
                </span>
                <span className="text-pava-brown/30">•</span>
                <span>Hasta 6 cuotas con tarjetas de crédito</span>
              </div>
            </div>

            {/* Low stock alert */}
            {!isOutOfStock && product.stock > 0 && product.stock <= 3 && (
              <div className="mb-6 inline-flex items-center gap-2 rounded-control bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 text-xs font-semibold text-amber-900">
                <span className="animate-pulse">🔥</span>
                <span>¡Últimas {product.stock} unidades disponibles en tienda!</span>
              </div>
            )}

            {/* Description */}
            <div className="prose prose-sm max-w-none mb-6 text-pava-brown-mid/80 leading-relaxed">
              <p>{product.longDescription ?? product.description}</p>
            </div>

            {/* Category Contextual Specifications & Craft Radar */}
            <div className="mb-8 rounded-2xl bg-pava-cream-dark/60 border border-pava-brown/12 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 font-display text-sm font-bold text-pava-brown">
                  <span className="text-lg">
                    {product.category === "mates"
                      ? "🧉"
                      : product.category === "yerbas"
                        ? "🌿"
                        : product.category === "termos"
                          ? "🔥"
                          : "✨"}
                  </span>
                  <span>
                    {product.category === "mates"
                      ? "Ficha Artesanal & Guía de Curado"
                      : product.category === "yerbas"
                        ? "Perfil de Sabor & Notas de Cata"
                        : product.category === "termos"
                          ? "Rendimiento Térmico & Aislamiento"
                          : "Especificaciones & Garantía"}
                  </span>
                </div>
                {product.category === "mates" && (
                  <button
                    type="button"
                    onClick={() => setShowCuradoSteps(!showCuradoSteps)}
                    className="text-xs font-bold text-pava-green hover:underline cursor-pointer bg-white px-2.5 py-1 rounded-full border border-pava-brown/10 shadow-xs"
                  >
                    {showCuradoSteps ? "Ocultar pasos" : "Ver Guía de Curado (4 pasos)"}
                  </button>
                )}
              </div>

              {/* Yerbas Tasting Radar */}
              {product.category === "yerbas" && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/80 rounded-xl p-3 border border-pava-brown/10">
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-pava-brown">Intensidad</span>
                        <span className="text-pava-green font-bold">Media / Intensa</span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            className={`h-1.5 flex-1 rounded-full ${
                              i <= 4 ? "bg-pava-green" : "bg-pava-brown/15"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/80 rounded-xl p-3 border border-pava-brown/10">
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-pava-brown">Rendimiento</span>
                        <span className="text-pava-green font-bold">+1.5L de agua</span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            className={`h-1.5 flex-1 rounded-full ${
                              i <= 5 ? "bg-pava-green" : "bg-pava-brown/15"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-pava-brown-mid/80 leading-relaxed">
                    💡 <strong>Consejo del Cebador:</strong> Cebar con agua entre 75°C y 80°C. Hidratar previamente con agua tibia en la hendidura para preservar el sabor y la espuma durante toda la ronda.
                  </p>
                </div>
              )}

              {/* Termos Thermal Gauge */}
              {product.category === "termos" && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/80 rounded-xl p-3 border border-pava-brown/10 flex items-center gap-3">
                      <span className="text-2xl">🔥</span>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-pava-gold-deep block">Agua Caliente</span>
                        <span className="text-sm font-bold text-pava-brown">+24 Horas</span>
                      </div>
                    </div>
                    <div className="bg-white/80 rounded-xl p-3 border border-pava-brown/10 flex items-center gap-3">
                      <span className="text-2xl">❄️</span>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-sky-700 block">Agua Fría / Hielo</span>
                        <span className="text-sm font-bold text-pava-brown">+36 Horas</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-pava-brown-mid/80 leading-relaxed">
                    🔒 <strong>Aislamiento de Doble Pared:</strong> Acero inoxidable 18/8 libre de BPA con pico cebador de precisión para un flujo de agua controlado.
                  </p>
                </div>
              )}

              {/* Mates Specifications & Curing steps */}
              {product.category === "mates" && (
                <div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div className="bg-white/80 rounded-lg p-2.5 border border-pava-brown/10 text-center">
                      <span className="text-[10px] text-pava-brown/60 block uppercase font-bold">Cuerpo</span>
                      <span className="font-bold text-pava-brown text-[11px]">Calabaza / Cuero</span>
                    </div>
                    <div className="bg-white/80 rounded-lg p-2.5 border border-pava-brown/10 text-center">
                      <span className="text-[10px] text-pava-brown/60 block uppercase font-bold">Virola</span>
                      <span className="font-bold text-pava-brown text-[11px]">Alpaca Maciza</span>
                    </div>
                    <div className="bg-white/80 rounded-lg p-2.5 border border-pava-brown/10 text-center">
                      <span className="text-[10px] text-pava-brown/60 block uppercase font-bold">Capacidad</span>
                      <span className="font-bold text-pava-brown text-[11px]">35g - 45g</span>
                    </div>
                  </div>

                  {showCuradoSteps && (
                    <div className="mt-3 pt-3 border-t border-pava-brown/10 space-y-2.5 text-xs text-pava-brown">
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pava-green text-white text-[10px] font-bold">1</span>
                        <p><strong>Enjuague inicial:</strong> Lavá el interior solo con agua tibia (sin detergente ni agua hirviendo).</p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pava-green text-white text-[10px] font-bold">2</span>
                        <p><strong>Llenado con yerba:</strong> Colocá yerba usada húmeda hasta el tope y agregá un chorrito de agua tibia. Dejá reposar 24 hs.</p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pava-green text-white text-[10px] font-bold">3</span>
                        <p><strong>Raspado suave:</strong> Vaciá el mate y con una cuchara sopera raspá suavemente las paredes interiores para desprender el hollejo suelto.</p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pava-green text-white text-[10px] font-bold">4</span>
                        <p><strong>Secado correcto:</strong> Repetí el proceso 1 o 2 veces más. Luego, secá siempre el mate boca arriba o de costado en un lugar ventilado.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Other categories */}
              {product.category !== "yerbas" && product.category !== "termos" && product.category !== "mates" && (
                <p className="text-xs text-pava-brown-mid/80 leading-relaxed pt-1">
                  Producto 100% artesanal seleccionado con el sello de calidad de Poné La Pava Catriel. Asesoramiento personalizado post-venta vía WhatsApp.
                </p>
              )}
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
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    disabled={quantity >= product.stock}
                    className="flex items-center justify-center w-11 h-11 text-pava-brown hover:text-pava-green hover:bg-pava-cream-dark transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
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

            {/* Interactive Shipping Estimator */}
            <div className="mt-6">
              <ShippingCalculator productPrice={product.price} />
            </div>

            {/* Value proposition badges */}
            <div className="mt-8 grid grid-cols-1 gap-3 rounded-card border border-pava-brown/10 bg-white/70 p-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pava-green/10 text-pava-green">
                  <Truck size={17} />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-pava-brown block">Envíos a todo el país</span>
                  <span className="text-pava-brown-mid/70">Gratis superando $65.000</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pava-green/10 text-pava-green">
                  <Store size={17} />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-pava-brown block">Retiro gratis en el local</span>
                  <span className="text-pava-brown-mid/70">Av. San Martín 374, Catriel (Río Negro)</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pava-green/10 text-pava-green">
                  <CreditCard size={17} />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-pava-brown block">Medios de pago</span>
                  <span className="text-pava-brown-mid/70">Transferencia (10% OFF), tarjeta y efectivo</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pava-green/10 text-pava-green">
                  <ShieldCheck size={17} />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-pava-brown block">Garantía y Asesoramiento</span>
                  <span className="text-pava-brown-mid/70">Soporte directo por WhatsApp para curado</span>
                </div>
              </div>
            </div>

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

      {/* Sticky Mobile Buy Bar */}
      {!isOutOfStock && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-pava-cream/95 backdrop-blur-md border-t border-pava-brown/15 p-3 px-4 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative w-11 h-11 shrink-0 overflow-hidden rounded-control bg-white border border-pava-brown/10">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="44px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-pava-brown truncate">{product.name}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-sm font-bold text-pava-green">{formatPrice(product.price)}</span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  {formatPrice(Math.round(product.price * 0.9))} efvo/transf
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={added}
            className={`flex items-center justify-center gap-1.5 rounded-control px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-pava-cream transition-all duration-200 active:scale-95 cursor-pointer shrink-0 shadow-sm ${
              added ? "bg-pava-green" : "bg-pava-green hover:bg-pava-green-light shadow-pava-green/20"
            }`}
          >
            <ShoppingBag size={14} />
            {added ? "¡Listo!" : "Agregar"}
          </button>
        </div>
      )}
    </div>
  );
}
