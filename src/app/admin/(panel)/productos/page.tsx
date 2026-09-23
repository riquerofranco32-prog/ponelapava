"use client";

import { useRef, useState, useEffect } from "react";
import { Plus, Search, PackageSearch, Zap, AlertTriangle, PackageX, CheckCircle2, Truck, LayoutGrid, LayoutList, Layers, Tag, X } from "lucide-react";
import { Product, Supplier, Category } from "@/types";
import ProductForm from "@/components/admin/ProductForm";
import { BulkPriceModal } from "@/components/admin/products/BulkPriceModal";
import { AdminButton } from "@/components/admin/AdminButton";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import { ProductDesktopRow } from "@/components/admin/products/ProductDesktopRow";
import { ProductMobileCard } from "@/components/admin/products/ProductMobileCard";
import { InventoryValuationWidget } from "@/components/admin/products/InventoryValuationWidget";
import { StockAdjustModal } from "@/components/admin/stock/StockAdjustModal";
import { StockHistoryModal } from "@/components/admin/stock/StockHistoryModal";
import { ReplenishmentSection } from "@/components/admin/stock/ReplenishmentSection";
import { SuppliersManagerModal } from "@/components/admin/stock/SuppliersManagerModal";
import { ProductsCategorySections } from "@/components/admin/products/ProductsCategorySections";
import { useAdminProducts } from "@/lib/useAdminProducts";
import { useAdminUser } from "@/context/AdminUserContext";

export default function AdminProductosPage() {
  const { isOwner } = useAdminUser();
  const {
    products,
    categories,
    loading,
    loadError,
    loadProducts,
    handleCreate,
    handleFormUpdate,
    handleStockChange,
    handleCategoryChange,
    handleBulkCategoryChange,
    handleDelete,
  } = useAdminProducts();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [activeView, setActiveView] = useState<"catalog" | "replenish">("catalog");
  const [catalogDisplayMode, setCatalogDisplayMode] = useState<"table" | "sections">("table");
  const [searchProduct, setSearchProduct] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out" | "available">("all");
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [newProductCategory, setNewProductCategory] = useState<string | undefined>(undefined);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [cloningProduct, setCloningProduct] = useState<Product | null>(null);
  const [bulkPriceOpen, setBulkPriceOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [suppliersModalOpen, setSuppliersModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  async function loadSuppliersList() {
    try {
      const res = await fetch("/api/admin/suppliers");
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data);
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadSuppliersList();
  }, []);

  function handleDuplicate(product: Product) {
    const cloned: Product = {
      ...product,
      id: "",
      name: `${product.name} (Copia)`,
      slug: `${product.slug}-copia`,
    };
    setCloningProduct(cloned);
  }

  // Support ?action=new, ?category=..., ?view=sections, and ?search=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "new") {
      setCreating(true);
      const cat = params.get("category") || params.get("categoria");
      if (cat) setNewProductCategory(cat);
    }
    const catParam = params.get("category") || params.get("categoria");
    if (catParam) {
      setCategoryFilter(catParam);
    }
    const viewParam = params.get("view");
    if (viewParam === "sections") {
      setCatalogDisplayMode("sections");
    }
    const q = params.get("search");
    if (q) {
      setSearchProduct(q);
    }
  }, []);

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.size === filteredProducts.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const handleAddProductToCategory = (categorySlug: string) => {
    setNewProductCategory(categorySlug);
    setCreating(true);
  };

  // "/" jumps straight to the product search, mirroring the shortcut
  // shoppers already know from GitHub/Linear-style tools.
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key !== "/") return;
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      e.preventDefault();
      searchInputRef.current?.focus();
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= (p.minStock ?? 5),
  ).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const inStockCount = products.filter((p) => p.stock > 0).length;
  const criticalReplenishmentCount = products.filter(
    (p) => p.stock <= (p.minStock ?? 5)
  ).length;

  const filteredProducts = products.filter((p) => {
    const matchCategory =
      categoryFilter === "all" || p.category === categoryFilter;
    const matchSearch =
      p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchProduct.toLowerCase());
    let matchStock = true;
    if (stockFilter === "low") {
      matchStock = p.stock <= (p.minStock ?? 5) && p.stock > 0;
    } else if (stockFilter === "out") {
      matchStock = p.stock === 0;
    } else if (stockFilter === "available") {
      matchStock = p.stock > 0;
    }
    return matchCategory && matchSearch && matchStock;
  });

  return (
    <div className="admin-page-reveal space-y-5">
      {loadError && <AdminErrorBanner message={loadError} />}

      {/* Valuation & Stock Health Stats */}
      {!loading && products.length > 0 && (
        <InventoryValuationWidget products={products} />
      )}

      {/* Main Top Navigation / View Switcher */}
      <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-3 flex-wrap gap-2.5">
        <div className="inline-flex items-center bg-[var(--dash-surface-2)] border border-[var(--dash-border)] rounded-[var(--dash-radius-md)] p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveView("catalog")}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--dash-radius-sm)] text-xs font-semibold cursor-pointer border-none transition-all ${
              activeView === "catalog"
                ? "bg-[var(--dash-surface)] text-[var(--dash-text)] shadow-sm"
                : "bg-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
            }`}
          >
            <LayoutGrid size={15} />
            <span>Catálogo</span>
            <span className="text-xs bg-[var(--dash-surface-3)] px-1.5 py-0.5 rounded-full font-bold">
              {products.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("replenish")}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--dash-radius-sm)] text-xs font-semibold cursor-pointer border-none transition-all ${
              activeView === "replenish"
                ? "bg-[var(--dash-surface)] text-[var(--dash-text)] shadow-sm"
                : "bg-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
            }`}
          >
            <Truck size={15} className="text-[var(--dash-warning)]" />
            <span>Reponer</span>
            {criticalReplenishmentCount > 0 && (
              <span className="text-xs bg-[var(--dash-warning)] text-[var(--dash-bg)] px-1.5 py-0.5 rounded-full font-bold">
                {criticalReplenishmentCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <AdminButton
            variant="secondary"
            onClick={() => setSuppliersModalOpen(true)}
            className="!text-xs !py-1.5"
          >
            <Truck size={14} className="mr-1 text-[var(--dash-accent)]" />
            <span>Proveedores ({suppliers.length})</span>
          </AdminButton>
        </div>
      </div>

      {activeView === "replenish" ? (
        <ReplenishmentSection
          products={products}
          suppliers={suppliers}
          onAdjustStock={(p) => setAdjustingProduct(p)}
        />
      ) : (
        <>
          {/* Quick Stock Status Filter Chips */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1.5">
            <button
              type="button"
              onClick={() => setStockFilter("all")}
              className={`admin-toolbar-pill inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap text-xs ${
                stockFilter === "all" ? "admin-toolbar-pill--active" : ""
              }`}
            >
              <span>Todos</span>
              <span className="text-xs bg-[var(--dash-surface-elevated)] px-1.5 py-0.5 rounded">
                {products.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStockFilter("low")}
              className={`admin-toolbar-pill inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap text-xs ${
                stockFilter === "low"
                  ? "border-[var(--dash-warning)] bg-[var(--dash-warning-bg)] text-[var(--dash-warning)] font-semibold"
                  : ""
              }`}
            >
              <AlertTriangle size={13} className="text-[var(--dash-warning)]" />
              <span>Bajo Stock (≤ Mínimo)</span>
              {lowStockCount > 0 && (
                <span className="text-xs font-bold bg-[var(--dash-warning)] text-[var(--dash-bg)] px-1.5 py-0.5 rounded-full">
                  {lowStockCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStockFilter("out")}
              className={`admin-toolbar-pill inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap text-xs ${
                stockFilter === "out"
                  ? "border-[var(--dash-danger)] bg-[var(--dash-danger-bg)] text-[var(--dash-danger)] font-semibold"
                  : ""
              }`}
            >
              <PackageX size={13} className="text-[var(--dash-danger)]" />
              <span>Sin Stock</span>
              {outOfStockCount > 0 && (
                <span className="text-xs font-bold bg-[var(--dash-danger)] text-white px-1.5 py-0.5 rounded-full">
                  {outOfStockCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStockFilter("available")}
              className={`admin-toolbar-pill inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap text-xs ${
                stockFilter === "available"
                  ? "border-[var(--dash-success)] bg-[var(--dash-success-bg)] text-[var(--dash-success)] font-semibold"
                  : ""
              }`}
            >
              <CheckCircle2 size={13} className="text-[var(--dash-success)]" />
              <span>En Stock</span>
              <span className="text-xs bg-[var(--dash-surface-elevated)] px-1.5 py-0.5 rounded">
                {inStockCount}
              </span>
            </button>
          </div>

          {/* Main Controls: Search, View Mode Switcher, Actions */}
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)] pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Buscar por nombre o marca... (/)"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="admin-input pl-9 w-full text-xs"
              />
            </div>

            {/* Display Mode: Tabla vs Por Categorías */}
            <div className="inline-flex items-center bg-[var(--dash-surface-2)] border border-[var(--dash-border)] rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setCatalogDisplayMode("table")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer border-none transition-all ${
                  catalogDisplayMode === "table"
                    ? "bg-[var(--dash-surface)] text-[var(--dash-text)] shadow-sm"
                    : "bg-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                }`}
                title="Vista en tabla general"
              >
                <LayoutList size={14} />
                <span>Tabla</span>
              </button>
              <button
                type="button"
                onClick={() => setCatalogDisplayMode("sections")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer border-none transition-all ${
                  catalogDisplayMode === "sections"
                    ? "bg-[var(--dash-surface)] text-[var(--dash-text)] shadow-sm"
                    : "bg-transparent text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                }`}
                title="Dividir en secciones por categoría"
              >
                <Layers size={14} />
                <span>Por Categorías</span>
              </button>
            </div>

            {isOwner && (
              <AdminButton
                variant="secondary"
                onClick={() => setBulkPriceOpen(true)}
                className="whitespace-nowrap"
              >
                <Zap size={14} className="text-[var(--dash-accent)] mr-1" />
                Ajuste Masivo
              </AdminButton>
            )}
            <AdminButton onClick={() => setCreating(true)} className="whitespace-nowrap">
              <Plus size={15} />
              Nuevo producto
            </AdminButton>
          </div>

          {/* Category Chips Bar with Live Counts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-thin">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={`admin-toolbar-pill inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap text-xs ${
                categoryFilter === "all" ? "admin-toolbar-pill--active" : ""
              }`}
            >
              <span>Todas las categorías</span>
              <span className="text-xs bg-[var(--dash-surface-3)] px-1.5 py-0.5 rounded-full font-bold">
                {products.length}
              </span>
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat.slug).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.slug)}
                  className={`admin-toolbar-pill inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap text-xs ${
                    categoryFilter === cat.slug ? "admin-toolbar-pill--active" : ""
                  }`}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  <span>{cat.name}</span>
                  <span className="text-xs bg-[var(--dash-surface-3)] px-1.5 py-0.5 rounded-full font-bold">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bulk Reassignment Action Bar */}
          {selectedProductIds.size > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)] flex items-center justify-between gap-3 animate-in fade-in flex-wrap shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--dash-text)]">
                  {selectedProductIds.size} producto{selectedProductIds.size !== 1 ? "s" : ""} seleccionado{selectedProductIds.size !== 1 ? "s" : ""}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedProductIds(new Set())}
                  className="text-xs text-[var(--dash-muted)] hover:text-[var(--dash-text)] underline cursor-pointer"
                >
                  Deseleccionar
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-[var(--dash-muted)]">
                  <span>Mover a categoría:</span>
                  <select
                    onChange={async (e) => {
                      if (!e.target.value) return;
                      await handleBulkCategoryChange(Array.from(selectedProductIds), e.target.value);
                      setSelectedProductIds(new Set());
                    }}
                    defaultValue=""
                    className="admin-input py-1 px-2.5 text-xs font-semibold"
                  >
                    <option value="" disabled>Elegir categoría destino...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.icon ? `${c.icon} ` : ""}{c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <TableSkeleton rows={6} />
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title={
                products.length === 0
                  ? "Todavía no hay productos"
                  : "Ningún producto coincide"
              }
              description={
                products.length === 0
                  ? "Creá el primero con el botón de arriba."
                  : "Probá con otra búsqueda o categoría."
              }
            />
          ) : catalogDisplayMode === "sections" ? (
            <ProductsCategorySections
              categories={
                categoryFilter === "all"
                  ? categories
                  : categories.filter((c) => c.slug === categoryFilter)
              }
              products={filteredProducts}
              onEdit={setEditingProduct}
              onDuplicate={handleDuplicate}
              onDelete={isOwner ? setDeletingProduct : undefined}
              onStockChange={handleStockChange}
              onCategoryChange={handleCategoryChange}
              onAdjustStock={(p) => setAdjustingProduct(p)}
              onViewHistory={(p) => setHistoryProduct(p)}
              onAddProductToCategory={handleAddProductToCategory}
            />
          ) : (
            <ProductsTable
              data={filteredProducts}
              categories={categories}
              onEdit={setEditingProduct}
              onDuplicate={handleDuplicate}
              onDelete={isOwner ? setDeletingProduct : undefined}
              onStockChange={handleStockChange}
              onCategoryChange={handleCategoryChange}
              onAdjustStock={(p) => setAdjustingProduct(p)}
              onViewHistory={(p) => setHistoryProduct(p)}
              selectable={true}
              selectedIds={selectedProductIds}
              onToggleSelect={toggleSelectProduct}
              onToggleSelectAll={toggleSelectAll}
            />
          )}
        </>
      )}

      {bulkPriceOpen && (
        <BulkPriceModal
          products={products}
          categories={categories}
          onClose={() => setBulkPriceOpen(false)}
          onSuccess={() => loadProducts(true)}
        />
      )}

      {creating && (
        <ProductForm
          categories={categories}
          defaultCategory={newProductCategory}
          onSave={async (input) => {
            await handleCreate(input);
            setCreating(false);
            setNewProductCategory(undefined);
          }}
          onCancel={() => {
            setCreating(false);
            setNewProductCategory(undefined);
          }}
        />
      )}
      {cloningProduct && (
        <ProductForm
          categories={categories}
          product={cloningProduct}
          onSave={async (input) => {
            await handleCreate(input);
            setCloningProduct(null);
          }}
          onCancel={() => setCloningProduct(null)}
        />
      )}

      {editingProduct && (
        <ProductForm
          categories={categories}
          product={editingProduct}
          onSave={async (input) => {
            await handleFormUpdate(editingProduct.id, input);
            setEditingProduct(null);
          }}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      {adjustingProduct && (
        <StockAdjustModal
          product={adjustingProduct}
          onClose={() => setAdjustingProduct(null)}
          onAdjusted={async () => {
            await loadProducts(true);
          }}
        />
      )}

      {historyProduct && (
        <StockHistoryModal
          product={historyProduct}
          onClose={() => setHistoryProduct(null)}
        />
      )}

      {suppliersModalOpen && (
        <SuppliersManagerModal
          onClose={() => setSuppliersModalOpen(false)}
          onSuppliersChanged={() => {
            loadSuppliersList();
          }}
        />
      )}

      {deletingProduct && (
        <ConfirmDialog
          title="Eliminar producto"
          message={`¿Eliminar "${deletingProduct.name}"? Esta acción no se puede deshacer.`}
          onConfirm={async () => {
            await handleDelete(deletingProduct);
            setDeletingProduct(null);
          }}
          onCancel={() => setDeletingProduct(null)}
        />
      )}
    </div>
  );
}

function ProductsTable({
  data,
  categories,
  onEdit,
  onDuplicate,
  onDelete,
  onStockChange,
  onCategoryChange,
  onAdjustStock,
  onViewHistory,
  selectable,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: {
  data: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDuplicate?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onStockChange: (product: Product, next: number) => Promise<void>;
  onCategoryChange: (product: Product, nextCategory: string) => Promise<void>;
  onAdjustStock?: (product: Product) => void;
  onViewHistory?: (product: Product) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
}) {
  return (
    <>
      {/* Desktop — full table with an inline stock stepper per row */}
      <div className="admin-desktop-only overflow-x-auto max-h-[70vh]">
        <table className="admin-table w-full text-sm border-collapse">
          <thead>
            <tr>
              {selectable && (
                <th className="px-3 py-2.5 text-center w-10">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selectedIds?.size === data.length}
                    onChange={onToggleSelectAll}
                    className="cursor-pointer rounded border-[var(--dash-border)] text-[var(--dash-accent)]"
                    aria-label="Seleccionar todos los productos"
                  />
                </th>
              )}
              <th className="text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">Producto</th>
              <th className="text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">Categoría</th>
              <th className="text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">Precio</th>
              <th className="text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">Stock</th>
              <th className="text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">Estado</th>
              <th className="text-right px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((product, index) => (
              <ProductDesktopRow
                key={product.id}
                index={index}
                product={product}
                categories={categories}
                selectable={selectable}
                selected={selectedIds?.has(product.id)}
                onToggleSelect={onToggleSelect}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onStockChange={onStockChange}
                onCategoryChange={onCategoryChange}
                onAdjustStock={onAdjustStock}
                onViewHistory={onViewHistory}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile — stacked cards, easier to tap and check stock from the counter */}
      <div className="admin-mobile-only flex flex-col gap-2.5">
        {data.map((product, index) => (
          <ProductMobileCard
            key={product.id}
            index={index}
            product={product}
            categories={categories}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onStockChange={onStockChange}
            onCategoryChange={onCategoryChange}
            onAdjustStock={onAdjustStock}
            onViewHistory={onViewHistory}
          />
        ))}
      </div>
    </>
  );
}
