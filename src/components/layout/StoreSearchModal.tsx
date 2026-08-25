"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X, ShoppingBag, ArrowRight, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { formatPrice, getCategoryLabel } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  status: string;
  stock: number;
  images: string[];
  tags: string[];
  brand?: string;
  weight?: string;
}

const POPULAR_SEARCHES = [
  "Imperial",
  "Camionero",
  "Playadito",
  "Termo",
  "Canarias",
  "Bombilla Pico de Loro",
  "Torpedo",
  "Combo",
];

export default function StoreSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { addItem, setDrawer } = useCart();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [addedId, setAddedId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchProducts = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Focus input on open
    const t = setTimeout(() => inputRef.current?.focus(), 60);

    // Initial load of top products if query is empty
    if (!query) {
      searchProducts("");
    }

    return () => clearTimeout(t);
  }, [isOpen, searchProducts, query]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSelectedIndex(0);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      searchProducts(val);
    }, 200);
  };

  const handleSelectProduct = (product: SearchProduct) => {
    onClose();
    router.push(`/producto/${product.id}`);
  };

  const handleQuickAdd = (e: React.MouseEvent, product: SearchProduct) => {
    e.stopPropagation();
    if (product.status === "out_of_stock" || product.stock <= 0) return;

    // Cast to full product shape needed by CartContext
    const fullProduct: Product = {
      ...product,
      description: "",
      category: product.category as Product["category"],
      status: product.status as Product["status"],
      featured: false,
      createdAt: new Date().toISOString(),
    };

    addItem(fullProduct, 1);
    setAddedId(product.id);
    setTimeout(() => {
      setAddedId(null);
      onClose();
      setDrawer(true);
    }, 600);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
      } else if (e.key === "Enter") {
        if (results[selectedIndex]) {
          e.preventDefault();
          handleSelectProduct(results[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-3 pt-12 sm:p-6 sm:pt-20 bg-pava-brown/60 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-pava-cream rounded-2xl shadow-2xl border border-pava-brown/15 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center px-4 sm:px-6 py-4 border-b border-pava-brown/10 bg-pava-cream-light gap-3">
          <Search className="w-5 h-5 text-pava-green shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Buscar mates, yerbas, termos, bombillas..."
            className="w-full bg-transparent text-pava-brown placeholder:text-pava-brown/40 text-base sm:text-lg font-medium focus:outline-none"
            aria-label="Buscar en la tienda"
          />
          {loading && <Loader2 className="w-4 h-4 text-pava-green animate-spin shrink-0" />}
          {query && !loading && (
            <button
              onClick={() => handleQueryChange("")}
              className="p-1 hover:bg-pava-brown/10 rounded-full text-pava-brown/60 transition-colors"
              aria-label="Borrar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 bg-pava-brown/5 hover:bg-pava-brown/10 text-pava-brown/70 rounded-md transition-colors shrink-0"
          >
            ESC
          </button>
        </div>

        {/* Popular Tags Pills */}
        <div className="px-4 sm:px-6 py-2.5 bg-pava-cream/60 border-b border-pava-brown/8 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-pava-brown/50 font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-pava-green" /> Populares:
          </span>
          {POPULAR_SEARCHES.map((tag) => (
            <button
              key={tag}
              onClick={() => handleQueryChange(tag)}
              className="px-2.5 py-1 bg-pava-brown/5 hover:bg-pava-green/10 hover:text-pava-green text-pava-brown/80 rounded-full font-medium transition-all shrink-0"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 divide-y divide-pava-brown/8"
        >
          {results.length === 0 && !loading && (
            <div className="py-12 text-center">
              <AlertCircle className="w-8 h-8 text-pava-brown/30 mx-auto mb-2" />
              <p className="font-semibold text-pava-brown text-base">
                No encontramos productos para &quot;{query}&quot;
              </p>
              <p className="text-xs text-pava-brown/60 mt-1 max-w-sm mx-auto">
                Probá buscando por categoría (mates, yerbas, termos), marca o modelos como Imperial o Torpedo.
              </p>
            </div>
          )}

          {results.map((product, idx) => {
            const isSelected = idx === selectedIndex;
            const isOut = product.status === "out_of_stock" || product.stock <= 0;
            const img = product.images?.[0] || "/placeholder-mate.jpg";

            return (
              <div
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`py-3 px-3 rounded-xl flex items-center gap-4 cursor-pointer transition-all ${
                  isSelected
                    ? "bg-pava-green/8 shadow-sm"
                    : "hover:bg-pava-brown/5"
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-pava-cream-dark overflow-hidden shrink-0 border border-pava-brown/10">
                  <Image
                    src={img}
                    alt={product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                  {isOut && (
                    <div className="absolute inset-0 bg-pava-brown/60 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="text-[9px] font-bold uppercase text-white tracking-wider px-1">
                        Agotado
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pava-brown/10 text-pava-brown">
                      {getCategoryLabel(product.category)}
                    </span>
                    {product.brand && (
                      <span className="text-xs text-pava-brown/60 font-medium truncate">
                        {product.brand}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-pava-brown text-sm sm:text-base leading-snug truncate">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-pava-green font-display">
                      {formatPrice(product.price)}
                    </span>
                    {product.weight && (
                      <span className="text-[11px] text-pava-brown/50">
                        ({product.weight})
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {!isOut && (
                    <button
                      onClick={(e) => handleQuickAdd(e, product)}
                      className={`p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        addedId === product.id
                          ? "bg-emerald-600 text-white"
                          : "bg-pava-green text-pava-cream hover:bg-pava-green-dark shadow-sm active:scale-95"
                      }`}
                      title="Agregar al carrito"
                      aria-label={`Agregar ${product.name} al carrito`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {addedId === product.id ? "¡Agregado!" : "Agregar"}
                      </span>
                    </button>
                  )}
                  <ArrowRight className="w-4 h-4 text-pava-brown/30 hidden sm:block" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Search Footer */}
        <div className="px-4 sm:px-6 py-3 bg-pava-cream-dark/50 border-t border-pava-brown/10 flex items-center justify-between text-xs text-pava-brown/60">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-pava-brown/10 rounded font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-pava-brown/10 rounded font-mono text-[10px]">↓</kbd> Navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-pava-brown/10 rounded font-mono text-[10px]">Enter</kbd> Ver producto
            </span>
          </div>
          <button
            onClick={() => {
              onClose();
              router.push(`/catalogo${query ? `?search=${encodeURIComponent(query)}` : ""}`);
            }}
            className="text-pava-green font-semibold hover:underline flex items-center gap-1"
          >
            Ver catálogo completo <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
