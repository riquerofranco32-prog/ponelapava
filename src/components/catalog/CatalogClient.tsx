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

  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState(false);

  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand && p.brand.trim()) brandsSet.add(p.brand.trim());
    });
    return Array.from(brandsSet).sort();
  }, [products]);

  const filtered = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Filter by brand
    if (selectedBrand !== "all") {
      result = result.filter((p) => p.brand?.toLowerCase() === selectedBrand.toLowerCase());
    }

    // Filter by in stock
    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0 || p.status === "available" || p.status === "featured");
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
    selectedBrand,
    inStockOnly,
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
            className="w-full pl-10 pr-9 py-3 rounded-control bg-white border border-pava-brown/15 text-pava-brown placeholder-pava-brown/40 text-sm focus:outline-none focus:border-pava-green transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              aria-label="Borrar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-pava-brown/40 hover:text-pava-brown p-1"
            >
              ✕
            </button>
          )}
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

        {/* In Stock toggle */}
        <button
          onClick={() => setInStockOnly((prev) => !prev)}
          aria-pressed={inStockOnly}
          className={`inline-flex items-center gap-1.5 rounded-control px-4 py-3 text-sm font-medium border transition-colors ${
            inStockOnly
              ? "bg-pava-green text-white border-pava-green"
              : "bg-white text-pava-brown border-pava-brown/15 hover:border-pava-green hover:text-pava-green"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${inStockOnly ? "bg-white" : "bg-emerald-500"}`} />
          En Stock
        </button>

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

      {/* Category tabs.
          scroll-pl-4 no es decorativo: sin él el scroll-snap alinea el primer
          chip contra el borde del scrollport ignorando el px-4, la fila queda
          con scrollLeft 16 al cargar y "Todos" pegado al borde de la pantalla
          mientras el resto de la página respeta su margen. El scroll-padding
          mueve el snapport hacia adentro y el chip cae donde corresponde. */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 scroll-pl-4 sm:mx-0 sm:px-0 sm:scroll-pl-0 sm:flex-wrap scrollbar-none snap-x">
        {categoryTabs.map(({ slug, name, count }) => (
          <button
            key={slug}
            onClick={() =>
              handleCategoryChange(slug as ProductCategory | "all")
            }
            className={`inline-flex items-center gap-1.5 rounded-control px-3.5 py-2 text-xs sm:text-sm font-medium border-2 transition-all duration-200 shrink-0 snap-start cursor-pointer ${
              activeCategory === slug
                ? "bg-pava-green text-pava-cream border-pava-green font-semibold shadow-xs"
                : "bg-white text-pava-brown border-pava-brown/15 hover:border-pava-green/50"
            }`}
          >
            <span>{name}</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                activeCategory === slug
                  ? "bg-pava-cream/20 text-pava-cream"
                  : "bg-pava-cream-dark text-pava-brown/60"
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Brand quick filter chips + In-Stock filter */}
      {availableBrands.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8 py-2.5 px-3.5 bg-pava-cream-dark/30 rounded-control border border-pava-brown/10">
          <span className="text-xs font-bold uppercase tracking-wider text-pava-gold-deep mr-1">
            Marca:
          </span>
          <button
            type="button"
            onClick={() => setSelectedBrand("all")}
            className={`rounded-chip px-2.5 py-1 text-xs font-semibold transition-all ${
              selectedBrand === "all"
                ? "bg-pava-green text-pava-cream shadow-xs"
                : "bg-white/80 text-pava-brown border border-pava-brown/10 hover:border-pava-green"
            }`}
          >
            Todas
          </button>
          {availableBrands.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBrand(selectedBrand === b ? "all" : b)}
              className={`rounded-chip px-2.5 py-1 text-xs font-semibold transition-all ${
                selectedBrand === b
                  ? "bg-pava-green text-pava-cream shadow-xs"
                  : "bg-white/80 text-pava-brown border border-pava-brown/10 hover:border-pava-green"
              }`}
            >
              {b}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInStockOnly((prev) => !prev)}
              className={`rounded-chip px-2.5 py-1 text-xs font-semibold border transition-all ${
                inStockOnly
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white/80 text-pava-brown border-pava-brown/15 hover:border-emerald-600"
              }`}
            >
              ✓ En stock
            </button>
          </div>
        </div>
      )}

      {/* Active filters chips bar */}
      {(activeCategory !== "all" || selectedBrand !== "all" || inStockOnly || search.trim() || minPrice || maxPrice || favoritesOnly) && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-semibold text-pava-brown-mid/70 mr-1">Filtros activos:</span>
          {activeCategory !== "all" && (
            <button
              onClick={() => handleCategoryChange("all")}
              className="inline-flex items-center gap-1.5 rounded-full bg-pava-green/10 border border-pava-green/20 px-3 py-1 text-xs font-medium text-pava-green hover:bg-pava-green/20 transition-colors"
            >
              <span>Categoría: {categories.find((c) => c.slug === activeCategory)?.name ?? activeCategory}</span>
              <span className="text-[10px]">✕</span>
            </button>
          )}
          {selectedBrand !== "all" && (
            <button
              onClick={() => setSelectedBrand("all")}
              className="inline-flex items-center gap-1.5 rounded-full bg-pava-gold/15 border border-pava-gold/30 px-3 py-1 text-xs font-semibold text-pava-brown hover:bg-pava-gold/25 transition-colors"
            >
              <span>Marca: {selectedBrand}</span>
              <span className="text-[10px]">✕</span>
            </button>
          )}
          {inStockOnly && (
            <button
              onClick={() => setInStockOnly(false)}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100 transition-colors"
            >
              <span>En stock</span>
              <span className="text-[10px]">✕</span>
            </button>
          )}
          {search.trim() && (
            <button
              onClick={() => handleSearchChange("")}
              className="inline-flex items-center gap-1.5 rounded-full bg-pava-brown/10 border border-pava-brown/15 px-3 py-1 text-xs font-medium text-pava-brown hover:bg-pava-brown/20 transition-colors"
            >
              <span>Búsqueda: &ldquo;{search}&rdquo;</span>
              <span className="text-[10px]">✕</span>
            </button>
          )}
          {(minPrice || maxPrice) && (
            <button
              onClick={clearPriceFilter}
              className="inline-flex items-center gap-1.5 rounded-full bg-pava-brown/10 border border-pava-brown/15 px-3 py-1 text-xs font-medium text-pava-brown hover:bg-pava-brown/20 transition-colors"
            >
              <span>Precio: {minPrice ? `$${minPrice}` : "$0"} – {maxPrice ? `$${maxPrice}` : "Max"}</span>
              <span className="text-[10px]">✕</span>
            </button>
          )}
          {favoritesOnly && (
            <button
              onClick={() => setFavoritesOnly(false)}
              className="inline-flex items-center gap-1.5 rounded-full bg-pava-terracotta/10 border border-pava-terracotta/20 px-3 py-1 text-xs font-medium text-pava-terracotta hover:bg-pava-terracotta/20 transition-colors"
            >
              <span>Favoritos</span>
              <span className="text-[10px]">✕</span>
            </button>
          )}
          <button
            onClick={() => {
              if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
              if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
              setSearch("");
              setActiveCategory("all");
              setSelectedBrand("all");
              setInStockOnly(false);
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
            className="text-xs text-pava-terracotta underline hover:text-pava-terracotta/80 ml-2 cursor-pointer"
          >
            Limpiar todos
          </button>
        </div>
      )}

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
