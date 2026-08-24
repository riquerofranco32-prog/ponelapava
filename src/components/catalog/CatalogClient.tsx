"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Heart,
} from "lucide-react";
import { Category, Product, ProductCategory } from "@/types";
import ProductCard from "@/components/catalog/ProductCard";
import { useFavorites } from "@/context/FavoritesContext";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

type SortOption = "default" | "price-asc" | "price-desc" | "name";

const SORT_OPTIONS: SortOption[] = [
  "default",
  "price-asc",
  "price-desc",
  "name",
];
const SEARCH_DEBOUNCE_MS = 300;

interface CatalogClientProps {
  products: Product[];
  categories: Category[];
}

export default function CatalogClient({
  products,
  categories,
}: CatalogClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const categoryParam = searchParams.get("cat");
  const initialCategory =
    categoryParam && categories.some((c) => c.slug === categoryParam)
      ? (categoryParam as ProductCategory)
      : "all";
  const sortParam = searchParams.get("sort");
  const initialSort = SORT_OPTIONS.includes(sortParam as SortOption)
    ? (sortParam as SortOption)
    : "default";
  const initialSearch = searchParams.get("q") ?? "";
  const initialMinPrice = searchParams.get("min") ?? "";
  const initialMaxPrice = searchParams.get("max") ?? "";

  const [search, setSearch] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">(
    initialCategory,
  );
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const { favoriteIds } = useFavorites();
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const priceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateUrl = useCallback(
    (next: {
      search: string;
      sort: SortOption;
      category: ProductCategory | "all";
      minPrice: string;
      maxPrice: string;
    }) => {
      const params = new URLSearchParams();
      if (next.category !== "all") params.set("cat", next.category);
      if (next.search.trim()) params.set("q", next.search);
      if (next.sort !== "default") params.set("sort", next.sort);
      if (next.minPrice.trim()) params.set("min", next.minPrice);
      if (next.maxPrice.trim()) params.set("max", next.maxPrice);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      updateUrl({
        search: value,
        sort,
        category: activeCategory,
        minPrice,
        maxPrice,
      });
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleSortChange = (value: SortOption) => {
    setSort(value);
    updateUrl({
      search,
      sort: value,
      category: activeCategory,
      minPrice,
      maxPrice,
    });
  };

  const handleCategoryChange = (value: ProductCategory | "all") => {
    setActiveCategory(value);
    updateUrl({ search, sort, category: value, minPrice, maxPrice });
  };

  const handlePriceChange = (bound: "min" | "max", value: string) => {
    const nextMin = bound === "min" ? value : minPrice;
    const nextMax = bound === "max" ? value : maxPrice;
    if (bound === "min") setMinPrice(value);
    else setMaxPrice(value);
    if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
    priceDebounceRef.current = setTimeout(() => {
      updateUrl({
        search,
        sort,
        category: activeCategory,
        minPrice: nextMin,
        maxPrice: nextMax,
      });
    }, SEARCH_DEBOUNCE_MS);
  };

  const clearPriceFilter = () => {
    if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
    setMinPrice("");
    setMaxPrice("");
    updateUrl({
      search,
      sort,
      category: activeCategory,
      minPrice: "",
      maxPrice: "",
    });
  };

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

    // Filter by price range
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) result = result.filter((p) => p.price >= min);
    if (!isNaN(max)) result = result.filter((p) => p.price <= max);

    // Filter by favorites
    if (favoritesOnly) {
      result = result.filter((p) => favoriteIds.has(p.id));
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
  }, [
    activeCategory,
    search,
    sort,
    products,
    minPrice,
    maxPrice,
    favoritesOnly,
    favoriteIds,
  ]);

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
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-control bg-white border border-pava-brown/15 text-pava-brown placeholder-pava-brown/40 text-sm focus:outline-none focus:border-pava-green transition-colors"
          />
        </div>

        {/* Price range */}
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            inputMode="numeric"
            aria-label="Precio mínimo"
            placeholder="Desde $"
            min={0}
            value={minPrice}
            onChange={(e) => handlePriceChange("min", e.target.value)}
            className="w-24 rounded-control bg-white border border-pava-brown/15 text-pava-brown placeholder-pava-brown/40 text-sm px-3 py-3 focus:outline-none focus:border-pava-green transition-colors"
          />
          <span className="text-pava-brown/40 text-sm">–</span>
          <input
            type="number"
            inputMode="numeric"
            aria-label="Precio máximo"
            placeholder="Hasta $"
            min={0}
            value={maxPrice}
            onChange={(e) => handlePriceChange("max", e.target.value)}
            className="w-24 rounded-control bg-white border border-pava-brown/15 text-pava-brown placeholder-pava-brown/40 text-sm px-3 py-3 focus:outline-none focus:border-pava-green transition-colors"
          />
          {(minPrice || maxPrice) && (
            <button
              onClick={clearPriceFilter}
              aria-label="Limpiar filtro de precio"
              className="text-pava-brown/50 hover:text-pava-green text-sm px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Favorites toggle */}
        <button
          onClick={() => setFavoritesOnly((prev) => !prev)}
          aria-pressed={favoritesOnly}
          className={`inline-flex items-center gap-1.5 rounded-control px-4 py-3 text-sm font-medium border transition-colors ${
            favoritesOnly
              ? "bg-pava-terracotta text-white border-pava-terracotta"
              : "bg-white text-pava-brown border-pava-brown/15 hover:border-pava-terracotta hover:text-pava-terracotta"
          }`}
        >
          <Heart size={15} className={favoritesOnly ? "fill-white" : ""} />
          Favoritos
        </button>

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
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="rounded-control bg-white border border-pava-brown/15 text-pava-brown text-sm px-3 py-3 focus:outline-none focus:border-pava-green transition-colors cursor-pointer"
          >
            <option value="default">Destacados</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="name">Nombre A-Z</option>
          </select>

          {/* View toggle — el `overflow-hidden` del grupo recorta el anillo de
              foco de los botones, que por la regla global sale 2px hacia
              afuera con 2px de offset (medido: se comía 3px). `focus-ring-inset`
              (globals.css) lo dibuja hacia adentro y entra entero. Va como
              clase propia y no como utilidad de Tailwind porque la regla
              global de foco está sin capa y le ganaría a la utilidad. */}
          <div className="flex overflow-hidden rounded-control border border-pava-brown/15 bg-white">
            <button
              onClick={() => setView("grid")}
              className={`focus-ring-inset flex items-center justify-center w-10 h-10 transition-colors ${
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
              className={`focus-ring-inset flex items-center justify-center w-10 h-10 transition-colors ${
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
            onClick={() =>
              handleCategoryChange(slug as ProductCategory | "all")
            }
            className={`inline-flex items-center gap-1.5 rounded-control px-4 py-2 text-sm font-medium border-2 transition-all duration-200 ${
              activeCategory === slug
                ? "bg-pava-green text-pava-cream border-pava-green"
                : "bg-white text-pava-brown border-pava-brown/15 hover:border-pava-green hover:text-pava-green"
            }`}
            aria-pressed={activeCategory === slug}
          >
            {name}
            {/* El conteo del chip inactivo estaba a /40, que sobre el blanco
                del chip da 2.17:1 — bien por debajo de 4.5:1 para 12px. A /70
                da 4.62:1. El del chip activo (crema /70 sobre verde) ya rinde
                5.19:1 y queda como está. */}
            <span
              className={`text-xs ${
                activeCategory === slug
                  ? "text-pava-cream/70"
                  : "text-pava-brown/70"
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
          <p className="text-4xl mb-4">{favoritesOnly ? "🤍" : "🌿"}</p>
          <p className="font-display text-xl text-pava-brown font-semibold mb-2">
            {favoritesOnly ? "Sin favoritos todavía" : "Sin resultados"}
          </p>
          <p className="text-pava-brown-mid/75 text-sm">
            {favoritesOnly
              ? "Tocá el corazón de un producto para guardarlo acá"
              : "Probá con otro término o revisá todas las categorías"}
          </p>
          <button
            onClick={() => {
              if (searchDebounceRef.current)
                clearTimeout(searchDebounceRef.current);
              if (priceDebounceRef.current)
                clearTimeout(priceDebounceRef.current);
              setSearch("");
              setActiveCategory("all");
              setMinPrice("");
              setMaxPrice("");
              setFavoritesOnly(false);
              updateUrl({
                search: "",
                sort,
                category: "all",
                minPrice: "",
                maxPrice: "",
              });
            }}
            className="mt-6 rounded-control px-6 py-3 bg-pava-green text-pava-cream text-sm font-medium border-2 border-pava-green hover:bg-pava-green-light transition-colors"
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
