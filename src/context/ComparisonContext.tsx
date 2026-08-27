"use client";

import { createContext, useContext, useState, useMemo, useCallback } from "react";
import { Product } from "@/types";

interface ComparisonContextValue {
  comparisonProducts: Product[];
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isComparing: (productId: string) => boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ComparisonContext = createContext<ComparisonContextValue | undefined>(undefined);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToComparison = useCallback((product: Product) => {
    setComparisonProducts((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      if (prev.length >= 3) {
        // Replace oldest if full
        return [...prev.slice(1), product];
      }
      return [...prev, product];
    });
    setIsOpen(true);
  }, []);

  const removeFromComparison = useCallback((productId: string) => {
    setComparisonProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonProducts([]);
  }, []);

  const isComparing = useCallback(
    (productId: string) => comparisonProducts.some((p) => p.id === productId),
    [comparisonProducts],
  );

  const value = useMemo(
    () => ({
      comparisonProducts,
      addToComparison,
      removeFromComparison,
      clearComparison,
      isComparing,
      isOpen,
      setIsOpen,
    }),
    [comparisonProducts, addToComparison, removeFromComparison, clearComparison, isComparing, isOpen],
  );

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison(): ComparisonContextValue {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
}
