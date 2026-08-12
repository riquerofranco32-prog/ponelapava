"use client";

import { useCart } from "@/context/CartContext";
import { Product } from "@/types";
import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";

interface AddToCartButtonProps {
  product: Product;
  disabled?: boolean;
  size?: "sm" | "md";
}

export default function AddToCartButton({
  product,
  disabled = false,
  size = "sm",
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
        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium tracking-wide text-pava-brown-mid/50 bg-pava-cream-dark border border-pava-brown/10 cursor-not-allowed"
      >
        Sin stock
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`w-full flex items-center justify-center gap-2 ${
        size === "sm" ? "py-2.5 text-xs" : "py-3 text-sm"
      } font-medium tracking-wide transition-all duration-200 border-2 ${
        added
          ? "bg-pava-green text-pava-cream border-pava-green"
          : "bg-transparent text-pava-green border-pava-green hover:bg-pava-green hover:text-pava-cream"
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
