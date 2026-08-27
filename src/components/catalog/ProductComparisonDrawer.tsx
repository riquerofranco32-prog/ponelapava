"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Scale, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useComparison } from "@/context/ComparisonContext";
import { useCart } from "@/context/CartContext";
import { formatPrice, getCategoryLabel } from "@/lib/utils";

export default function ProductComparisonDrawer() {
  const { comparisonProducts, removeFromComparison, clearComparison, isOpen, setIsOpen } = useComparison();
  const { addItem, setDrawer } = useCart();

  if (!isOpen || comparisonProducts.length === 0) return null;

  const handleAddToCart = (p: typeof comparisonProducts[0]) => {
    addItem(p);
    setIsOpen(false);
    setDrawer(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-pava-brown/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-pava-brown/15 bg-pava-cream shadow-2xl p-5 sm:p-8 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-pava-brown/10 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pava-green/15 text-pava-green">
              <Scale size={18} />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-pava-brown">
                Comparador Matero ({comparisonProducts.length}/3)
              </h3>
              <p className="text-xs text-pava-brown-mid/70">
                Compará especificaciones, materiales y precios lado a lado
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearComparison}
              className="text-xs text-pava-brown/50 hover:text-pava-terracotta transition-colors flex items-center gap-1"
            >
              <Trash2 size={13} />
              <span>Limpiar</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-pava-brown/50 hover:bg-pava-brown/10 hover:text-pava-brown transition-colors"
              aria-label="Cerrar comparador"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Comparison Table Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {comparisonProducts.map((product) => {
            const isOutOfStock = product.status === "out_of_stock";

            return (
              <div
                key={product.id}
                className="flex flex-col justify-between rounded-2xl border border-pava-brown/12 bg-white p-4 shadow-sm relative group"
              >
                {/* Remove button */}
                <button
                  onClick={() => removeFromComparison(product.id)}
                  className="absolute top-3 right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-pava-cream text-pava-brown/50 hover:text-pava-terracotta hover:bg-pava-terracotta/10 transition-colors"
                  title="Quitar del comparador"
                  aria-label={`Quitar ${product.name}`}
                >
                  <X size={13} />
                </button>

                <div>
                  {/* Image */}
                  <Link
                    href={`/producto/${product.id}`}
                    onClick={() => setIsOpen(false)}
                    className="relative block h-36 w-full rounded-xl overflow-hidden bg-pava-cream/60 border border-pava-brown/10 mb-3"
                  >
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>

                  {/* Badges & Name */}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pava-green">
                    {getCategoryLabel(product.category)}
                  </span>
                  <h4 className="font-display text-sm font-bold text-pava-brown line-clamp-2 mt-0.5 mb-2">
                    {product.name}
                  </h4>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="font-display text-lg font-bold text-pava-green block">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {formatPrice(Math.round(product.price * 0.9))} c/ Transferencia
                    </span>
                  </div>

                  {/* Specs Rows */}
                  <div className="space-y-2 border-t border-pava-brown/10 pt-3 text-xs">
                    <div className="flex justify-between text-pava-brown-mid/80">
                      <span>Marca:</span>
                      <strong className="text-pava-brown">{product.brand || "Poné La Pava"}</strong>
                    </div>

                    <div className="flex justify-between text-pava-brown-mid/80">
                      <span>Peso / Capacidad:</span>
                      <strong className="text-pava-brown">{product.weight || "Estándar"}</strong>
                    </div>

                    <div className="flex justify-between text-pava-brown-mid/80">
                      <span>Disponibilidad:</span>
                      <span className={`font-semibold ${isOutOfStock ? "text-red-700" : "text-emerald-700"}`}>
                        {isOutOfStock ? "Agotado" : "En Stock"}
                      </span>
                    </div>

                    <div className="flex justify-between text-pava-brown-mid/80">
                      <span>Curado:</span>
                      <strong className="text-pava-brown">
                        {product.category === "mates" ? "Recomendado" : "Listo para usar"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-pava-brown/10 space-y-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={isOutOfStock}
                    className="w-full flex items-center justify-center gap-1.5 rounded-control bg-pava-green py-2.5 text-xs font-bold text-pava-cream hover:bg-pava-green-light transition-all disabled:opacity-40"
                  >
                    <ShoppingBag size={13} />
                    <span>{isOutOfStock ? "Sin stock" : "Elegir este"}</span>
                  </button>

                  <Link
                    href={`/producto/${product.id}`}
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-1 text-[11px] font-semibold text-pava-brown-mid/80 hover:text-pava-green transition-colors py-1"
                  >
                    <span>Ver ficha completa</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
