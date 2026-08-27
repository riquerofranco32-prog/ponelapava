"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  MessageCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { whatsappChatUrl } from "@/lib/whatsapp";

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FavoritesDrawer({
  isOpen,
  onClose,
}: FavoritesDrawerProps) {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { addItem, setDrawer } = useCart();
  const settings = useSiteSettings();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Load products when drawer opens
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    fetch("/api/products/search?q=")
      .then((res) => res.json())
      .then((data: Product[]) => {
        if (Array.isArray(data)) {
          setAllProducts(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  const favoriteProducts = allProducts.filter((p) => favoriteIds.has(p.id));
  const totalValue = favoriteProducts.reduce((acc, p) => acc + p.price, 0);

  const handleAddSingle = (product: Product) => {
    addItem(product);
    setAddedIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1500);
  };

  const handleAddAll = () => {
    favoriteProducts
      .filter((p) => p.status !== "out_of_stock")
      .forEach((p) => addItem(p));
    onClose();
    setDrawer(true);
  };

  const getWhatsAppWishlistUrl = () => {
    const listText = favoriteProducts
      .map((p) => `• ${p.name} (${formatPrice(p.price)})`)
      .join("\n");
    const msg = `¡Hola! Me gustaría consultar por mis productos favoritos de Poné La Pava:\n\n${listText}\n\nTotal estimado: ${formatPrice(totalValue)}`;
    return whatsappChatUrl(settings.whatsappNumber, msg);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-pava-brown/60 backdrop-blur-sm transition-all duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-label="Lista de Favoritos"
        aria-modal="true"
        className={`fixed top-0 right-0 h-full w-full max-w-sm sm:max-w-md z-[70] bg-pava-cream shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-pava-brown/10 bg-white/70">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pava-terracotta/10 text-pava-terracotta">
              <Heart size={18} className="fill-pava-terracotta" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-pava-brown">
                Tus Favoritos
              </h3>
              <p className="text-[11px] text-pava-brown-mid/70">
                {favoriteIds.size} {favoriteIds.size === 1 ? "guardado" : "guardados"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-pava-brown/50 hover:bg-pava-brown/10 hover:text-pava-brown transition-colors"
            aria-label="Cerrar favoritos"
          >
            <X size={18} />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <span className="animate-spin text-2xl mb-2">🧉</span>
              <p className="text-xs text-pava-brown-mid/70">Cargando favoritos...</p>
            </div>
          ) : favoriteProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-pava-brown/5 text-pava-brown/30 mb-4">
                <Heart size={32} />
              </span>
              <h4 className="font-display text-base font-bold text-pava-brown">
                No tenés favoritos guardados
              </h4>
              <p className="text-xs text-pava-brown-mid/70 max-w-[240px] mt-1 mb-5 leading-relaxed">
                Hacé click en el corazón de cualquier producto para guardarlo acá y no perderlo.
              </p>
              <Link
                href="/catalogo"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-control bg-pava-green px-5 py-2.5 text-xs font-bold text-pava-cream hover:bg-pava-green-light transition-colors"
              >
                <span>Explorar catálogo</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            favoriteProducts.map((product) => {
              const isAdded = addedIds.has(product.id);
              const isOutOfStock = product.status === "out_of_stock";

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-2xl border border-pava-brown/10 bg-white p-3 shadow-sm transition-all hover:border-pava-brown/20"
                >
                  {/* Thumbnail */}
                  <Link
                    href={`/producto/${product.id}`}
                    onClick={onClose}
                    className="relative h-18 w-18 shrink-0 overflow-hidden rounded-xl bg-pava-cream/60 border border-pava-brown/10"
                  >
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/producto/${product.id}`}
                      onClick={onClose}
                      className="font-medium text-xs text-pava-brown hover:text-pava-green transition-colors line-clamp-1 block"
                    >
                      {product.name}
                    </Link>

                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-display text-sm font-bold text-pava-green">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                        -10% c/ transf.
                      </span>
                    </div>

                    {/* Quick Add Button */}
                    <div className="mt-2 flex items-center gap-2">
                      {!isOutOfStock ? (
                        <button
                          onClick={() => handleAddSingle(product)}
                          disabled={isAdded}
                          className={`flex items-center gap-1 rounded-control px-2.5 py-1 text-[11px] font-semibold transition-all ${
                            isAdded
                              ? "bg-emerald-600 text-white"
                              : "bg-pava-green text-pava-cream hover:bg-pava-green-light"
                          }`}
                        >
                          <ShoppingBag size={11} />
                          <span>{isAdded ? "¡Agregado!" : "Al carrito"}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-pava-brown/50 font-medium">
                          Sin stock
                        </span>
                      )}

                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="flex h-6 w-6 items-center justify-center rounded text-pava-brown/40 hover:text-pava-terracotta transition-colors ml-auto"
                        title="Quitar de favoritos"
                        aria-label={`Quitar ${product.name} de favoritos`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        {favoriteProducts.length > 0 && (
          <div className="border-t border-pava-brown/10 bg-white/80 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-pava-brown-mid/80 font-medium">
                Total de tus guardados:
              </span>
              <div className="text-right">
                <span className="font-display text-base font-bold text-pava-brown block">
                  {formatPrice(totalValue)}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  {formatPrice(Math.round(totalValue * 0.9))} con transferencia
                </span>
              </div>
            </div>

            <button
              onClick={handleAddAll}
              className="w-full flex items-center justify-center gap-2 rounded-control bg-pava-green py-3 text-xs font-bold text-pava-cream hover:bg-pava-green-light transition-all shadow-md active:scale-[0.99]"
            >
              <ShoppingBag size={15} />
              <span>Mover todos al carrito</span>
            </button>

            <a
              href={getWhatsAppWishlistUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-control border border-whatsapp bg-whatsapp/10 py-2.5 text-xs font-bold text-whatsapp hover:bg-whatsapp hover:text-white transition-colors"
            >
              <MessageCircle size={14} />
              <span>Consultar lista por WhatsApp</span>
            </a>
          </div>
        )}
      </div>
    </>
  );
}
