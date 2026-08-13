"use client";

import { useState, useMemo } from "react";
import { Search, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { categories } from "@/data/categories";
import { Product, ProductCategory } from "@/types";
import ProductCard from "@/components/catalog/ProductCard";
import { useSearchParams } from "next/navigation";

type SortOption = "default" | "price-asc" | "price-desc" | "name";

interface CatalogClientProps {
  products: Product[];
}

export default function CatalogClient({ products }: CatalogClientProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("cat");
  const initialCategory =
    categoryParam &&
    ["yerbas", "mates", "bombillas", "termos", "accesorios", "combos"].includes(
      categoryParam,
    )
      ? (categoryParam as ProductCategory)
      : "all";
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">(
    initialCategory,
  );
  const [sort, setSort] = useState<SortOption>("default");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // Sort
    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // featured first
        result.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
    }

    return result;
  }, [activeCategory, search, sort]);

  const categoryTabs = [
    { slug: "all" as const, name: "Todos", count: products.length },
    ...categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      count: products.filter((p) => p.category === c.slug).length,
    })),
  ];

  return (
    <div>
      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-pava-brown/40"
          />
          <input
            id="catalog-search"
            type="search"
            aria-label="Buscar productos"
            placeholder="Buscar yerbas, mates, termos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-pava-brown/15 text-pava-brown placeholder-pava-brown/40 text-sm focus:outline-none focus:border-pava-green transition-colors"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            size={15}
            className="text-pava-brown/50 shrink-0"
          />
          <select
            id="catalog-sort"
            aria-label="Ordenar productos"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="bg-white border border-pava-brown/15 text-pava-brown text-sm px-3 py-3 focus:outline-none focus:border-pava-green transition-colors cursor-pointer"
          >
            <option value="default">Destacados</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="name">Nombre A-Z</option>
          </select>

          {/* View toggle */}
          <div className="flex border border-pava-brown/15 bg-white">
            <button
              onClick={() => setView("grid")}
              className={`flex items-center justify-center w-10 h-10 transition-colors ${
                view === "grid"
                  ? "bg-pava-green text-pava-cream"
                  : "text-pava-brown hover:text-pava-green"
              }`}
              aria-label="Vista en grilla"
              aria-pressed={view === "grid"}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center justify-center w-10 h-10 transition-colors ${
                view === "list"
                  ? "bg-pava-green text-pava-cream"
                  : "text-pava-brown hover:text-pava-green"
              }`}
              aria-label="Vista en lista"
              aria-pressed={view === "list"}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {categoryTabs.map(({ slug, name, count }) => (
          <button
            key={slug}
            onClick={() => setActiveCategory(slug as ProductCategory | "all")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-2 transition-all duration-200 ${
              activeCategory === slug
                ? "bg-pava-green text-pava-cream border-pava-green"
                : "bg-white text-pava-brown border-pava-brown/15 hover:border-pava-green hover:text-pava-green"
            }`}
            aria-pressed={activeCategory === slug}
          >
            {name}
            <span
              className={`text-xs ${
                activeCategory === slug
                  ? "text-pava-cream/70"
                  : "text-pava-brown/40"
              }`}
            >
              ({count})
            </span>
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-pava-brown-mid/75 mb-6">
        {filtered.length === 0
          ? "No se encontraron productos"
          : `${filtered.length} producto${filtered.length !== 1 ? "s" : ""}`}
        {search && ` para "${search}"`}
      </p>

      {/* Products grid/list */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-4xl mb-4">🌿</p>
          <p className="font-display text-xl text-pava-brown font-semibold mb-2">
            Sin resultados
          </p>
          <p className="text-pava-brown-mid/75 text-sm">
            Probá con otro término o revisá todas las categorías
          </p>
          <button
            onClick={() => {
              setSearch("");
              setActiveCategory("all");
            }}
            className="mt-6 px-6 py-3 bg-pava-green text-pava-cream text-sm font-medium border-2 border-pava-green hover:bg-pava-green-light transition-colors"
          >
            Ver todos los productos
          </button>
        </div>
      ) : (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6"
              : "flex flex-col gap-3"
          }
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} view={view} />
          ))}
        </div>
      )}
    </div>
  );
}
