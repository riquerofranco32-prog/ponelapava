"use client";

import { useCart } from "@/context/CartContext";
import { Product } from "@/types";
import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";

interface AddToCartButtonProps {
  product: Product;
  disabled?: boolean;
  size?: "sm" | "md";
  overlay?: boolean;
}

export default function AddToCartButton({
  product,
  disabled = false,
  size = "sm",
  overlay = false,
}: AddToCartButtonProps) {
  const { addItem, setDrawer } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (disabled || added) return;
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setDrawer(true);
    }, 1000);
  };

  if (disabled) {
    return (
      <button
        disabled
        className={`flex w-full items-center justify-center gap-2 rounded-control border border-pava-brown/10 py-3 text-xs font-medium tracking-[0.08em] text-pava-brown-mid/50 cursor-not-allowed ${
          overlay ? "bg-pava-cream/80 backdrop-blur-sm" : "bg-pava-cream-dark"
        }`}
      >
        Sin stock
      </button>
    );
  }

  if (overlay) {
    return (
      <button
        onClick={handleAdd}
        className={`flex w-full items-center justify-center gap-2 rounded-control py-2.5 text-[12px] font-semibold tracking-wide transition-all duration-200 active:scale-[0.98] ${
          added
            ? "bg-pava-green text-pava-cream"
            : "bg-pava-cream/95 text-pava-green hover:bg-pava-gold hover:text-pava-brown backdrop-blur-sm"
        }`}
        aria-label={added ? "Producto agregado al carrito" : `Agregar ${product.name} al carrito`}
      >
        {added ? (
          <>
            <Check size={13} />
            Agregado
          </>
        ) : (
          <>
            <ShoppingBag size={13} />
            Agregar al carrito
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`w-full flex items-center justify-center gap-2 rounded-control ${
        size === "sm" ? "py-3 text-xs" : "py-3.5 text-sm"
      } border border-pava-green font-semibold tracking-[0.08em] transition-all duration-200 ${
        added
          ? "bg-pava-green text-pava-cream border-pava-green"
          : "bg-transparent text-pava-green hover:bg-pava-green hover:text-pava-cream"
      } active:scale-[0.98]`}
      aria-label={added ? "Producto agregado al carrito" : `Agregar ${product.name} al carrito`}
    >
      {added ? (
        <>
          <Check size={14} />
          Agregado
        </>
      ) : (
        <>
          <ShoppingBag size={14} />
          Agregar
        </>
      )}
    </button>
  );
}
