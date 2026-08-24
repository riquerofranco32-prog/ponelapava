"use client";

import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    setDrawer,
    updateQuantity,
    removeItem,
    itemCount,
    total,
  } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-pava-brown/50 backdrop-blur-sm transition-all duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setDrawer(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-label="Carrito de compras"
        aria-modal="true"
        className={`fixed top-0 right-0 h-full w-full max-w-sm z-[70] bg-pava-cream shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-pava-brown/10">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-pava-green" />
            <span className="font-display text-lg font-bold text-pava-brown">
              Tu carrito
            </span>
            {itemCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 bg-pava-green text-pava-cream text-[11px] font-bold rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setDrawer(false)}
            className="flex items-center justify-center w-8 h-8 text-pava-brown hover:text-pava-green transition-colors"
            aria-label="Cerrar carrito"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={40} className="text-pava-brown/20 mb-4" />
              <p className="text-pava-brown font-medium mb-2">
                Tu carrito está vacío
              </p>
              <p className="text-sm text-pava-brown-mid/60 mb-6">
                Agregá productos desde el catálogo
              </p>
              <Link
                href="/catalogo"
                onClick={() => setDrawer(false)}
                className="inline-flex items-center gap-2 rounded-control px-6 py-3 bg-pava-green text-pava-cream text-sm font-medium border-2 border-pava-green hover:bg-pava-green-light transition-colors"
              >
                Ver catálogo
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="flex gap-3 pb-4 border-b border-pava-brown/8"
                >
                  {/* Image */}
                  <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded-control">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-pava-brown leading-tight line-clamp-2">
                      {product.name}
                    </p>
                    <p className="text-sm font-bold text-pava-green mt-1">
                      {formatPrice(product.price)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      {/* tap-44: los ± miden 24×24 y el tacho 14×14, muy por
                          debajo del dedo. La clase agranda el área sensible a
                          44px sin tocar el tamaño visible ni el layout. */}
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="tap-44 flex items-center justify-center w-6 h-6 rounded-chip border border-pava-brown/20 hover:border-pava-green hover:text-pava-green transition-colors"
                        aria-label="Reducir cantidad"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-sm font-medium text-pava-brown w-6 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="tap-44 flex items-center justify-center w-6 h-6 rounded-chip border border-pava-brown/20 hover:border-pava-green hover:text-pava-green transition-colors disabled:opacity-40 disabled:hover:border-pava-brown/20 disabled:hover:text-inherit"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus size={11} />
                      </button>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="tap-44 ml-auto text-pava-brown/30 hover:text-pava-terracotta transition-colors"
                        aria-label={`Eliminar ${product.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-pava-brown/10 px-5 py-5 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-pava-brown-mid/70">Total</span>
              <span className="font-display text-xl font-bold text-pava-brown">
                {formatPrice(total)}
              </span>
            </div>

            {/* Actions */}
            <Link
              href="/carrito"
              onClick={() => setDrawer(false)}
              className="flex items-center justify-center w-full rounded-control py-3 bg-pava-green text-pava-cream text-sm font-semibold tracking-wide border-2 border-pava-green hover:bg-pava-green-light transition-colors"
            >
              Ver carrito completo
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
