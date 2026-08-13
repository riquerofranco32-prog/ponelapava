"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  MessageCircle,
  ChevronLeft,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import PageHeader from "@/components/layout/PageHeader";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, total, itemCount } =
    useCart();
  const settings = useSiteSettings();
  const [customerName, setCustomerName] = useState("");
  const [comment, setComment] = useState("");

  const handleWhatsApp = async () => {
    if (items.length === 0) return;
    const orderData = {
      customerName: customerName || "Sin nombre",
      items,
      total,
      comment,
    };
    // Best-effort: a DB hiccup shouldn't block the customer from ordering —
    // the WhatsApp message is still the source of truth for the sale.
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
    } catch {
      // ignore — WhatsApp still opens below
    }
    const url = buildWhatsAppUrl(settings.whatsappNumber, orderData);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (items.length === 0) {
    return (
      <div className="bg-pava-cream min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4 py-20">
          <ShoppingBag size={48} className="mx-auto text-pava-brown/20 mb-6" />
          <h1 className="font-display text-3xl font-bold text-pava-brown mb-3">
            Tu carrito está vacío
          </h1>
          <p className="text-pava-brown-mid/70 mb-8">
            Explorá nuestro catálogo y encontrá lo que estás buscando.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 rounded-control px-8 py-4 bg-pava-green text-pava-cream text-sm font-semibold border-2 border-pava-green hover:bg-pava-green-light transition-colors"
          >
            Ir al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-pava-cream min-h-screen">
      <PageHeader
        eyebrow="Tu selección"
        title="Carrito"
        description={`${itemCount} producto${itemCount !== 1 ? "s" : ""} en tu carrito`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          {/* Items list */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-pava-brown">
                Productos
              </h2>
              <button
                onClick={clearCart}
                className="text-xs text-pava-brown/40 hover:text-pava-terracotta transition-colors underline underline-offset-2"
              >
                Vaciar carrito
              </button>
            </div>

            <ul className="space-y-4">
              {items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="flex gap-4 p-4 rounded-card bg-white border border-pava-brown/8"
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-control">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/producto/${product.id}`}
                      className="text-sm font-medium text-pava-brown hover:text-pava-green transition-colors leading-tight line-clamp-2 block"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-pava-brown/50 mt-0.5 mb-3">
                      {formatPrice(product.price)} c/u
                    </p>

                    <div className="flex items-center justify-between">
                      {/* Quantity */}
                      <div className="flex items-center overflow-hidden rounded-control border border-pava-brown/15">
                        <button
                          onClick={() =>
                            updateQuantity(product.id, quantity - 1)
                          }
                          className="flex items-center justify-center w-8 h-8 text-pava-brown hover:text-pava-green hover:bg-pava-cream-dark transition-colors"
                          aria-label="Reducir cantidad"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-pava-brown">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(product.id, quantity + 1)
                          }
                          className="flex items-center justify-center w-8 h-8 text-pava-brown hover:text-pava-green hover:bg-pava-cream-dark transition-colors"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-display font-bold text-pava-green">
                          {formatPrice(product.price * quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-pava-brown/30 hover:text-pava-terracotta transition-colors"
                          aria-label={`Eliminar ${product.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 mt-8 text-sm text-pava-brown/50 hover:text-pava-green transition-colors"
            >
              <ChevronLeft size={15} />
              Seguir eligiendo productos
            </Link>
          </div>

          {/* Summary & checkout */}
          <div className="lg:col-span-1">
            <div className="rounded-card bg-white border border-pava-brown/8 p-6 sticky top-24">
              <h2 className="font-display text-xl font-bold text-pava-brown mb-6">
                Resumen del pedido
              </h2>

              {/* Line items */}
              <div className="space-y-3 mb-5 pb-5 border-b border-pava-brown/10">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-pava-brown-mid/70 line-clamp-1 flex-1 mr-2">
                      {product.name} x{quantity}
                    </span>
                    <span className="text-pava-brown font-medium shrink-0">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-pava-brown font-medium">Total</span>
                <span className="font-display text-2xl font-bold text-pava-green">
                  {formatPrice(total)}
                </span>
              </div>

              {/* Customer form */}
              <div className="space-y-3 mb-6">
                <div>
                  <label
                    htmlFor="customer-name"
                    className="block text-xs font-medium text-pava-brown/70 mb-1"
                  >
                    Tu nombre *
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    placeholder="¿Cómo te llamás?"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-control px-3 py-2.5 bg-pava-cream border border-pava-brown/15 text-pava-brown text-sm placeholder-pava-brown/40 focus:outline-none focus:border-pava-green transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="order-comment"
                    className="block text-xs font-medium text-pava-brown/70 mb-1"
                  >
                    Comentario (opcional)
                  </label>
                  <textarea
                    id="order-comment"
                    placeholder="¿Alguna aclaración sobre tu pedido?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full rounded-control px-3 py-2.5 bg-pava-cream border border-pava-brown/15 text-pava-brown text-sm placeholder-pava-brown/40 focus:outline-none focus:border-pava-green transition-colors resize-none"
                  />
                </div>
              </div>

              {/* WhatsApp CTA */}
              <button
                onClick={handleWhatsApp}
                disabled={!customerName.trim()}
                className="flex items-center justify-center gap-2 w-full rounded-control py-4 bg-whatsapp text-white text-sm font-semibold border-2 border-whatsapp hover:bg-whatsapp-dark hover:border-whatsapp-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle size={18} />
                Enviar pedido por WhatsApp
              </button>
              {!customerName.trim() && (
                <p className="text-xs text-pava-brown/50 text-center mt-2">
                  Completá tu nombre para continuar
                </p>
              )}

              <p className="text-xs text-pava-brown/40 text-center mt-4 leading-relaxed">
                Se abrirá WhatsApp con tu pedido pre-armado. Coordinamos la
                entrega o retiro en el local.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
