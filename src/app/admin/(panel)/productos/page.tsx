"use client";

import { useRef, useState, useEffect } from "react";
import { Plus, Search, PackageSearch, Zap, AlertTriangle, PackageX, CheckCircle2 } from "lucide-react";
import { Product } from "@/types";
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
import { useAdminProducts } from "@/lib/useAdminProducts";

export default function AdminProductosPage() {
  const {
    products,
    categories,
    loading,
    loadError,
    loadProducts,
    handleCreate,
    handleFormUpdate,
    handleStockChange,
    handleDelete,
  } = useAdminProducts();
  const [searchProduct, setSearchProduct] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out" | "available">("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [cloningProduct, setCloningProduct] = useState<Product | null>(null);
  const [bulkPriceOpen, setBulkPriceOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  function handleDuplicate(product: Product) {
    const cloned: Product = {
      ...product,
      id: "",
      name: `${product.name} (Copia)`,
      slug: `${product.slug}-copia`,
    };
    setCloningProduct(cloned);
  }

  // Support ?action=new and ?search=... from command palette or direct links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "new") {
      setCreating(true);
    }
    const q = params.get("search");
    if (q) {
      setSearchProduct(q);
    }
  }, []);

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
    (p) => p.stock > 0 && p.stock <= 3,
  ).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const inStockCount = products.filter((p) => p.stock > 0).length;

  const filteredProducts = products.filter((p) => {
    const matchCategory =
      categoryFilter === "all" || p.category === categoryFilter;
    const matchSearch =
      p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchProduct.toLowerCase());
    let matchStock = true;
    if (stockFilter === "low") {
      matchStock = p.stock > 0 && p.stock <= 3;
    } else if (stockFilter === "out") {
      matchStock = p.stock === 0;
    } else if (stockFilter === "available") {
      matchStock = p.stock > 0;
    }
    return matchCategory && matchSearch && matchStock;
  });

  return (
    <div className="admin-page-reveal">
      {loadError && <AdminErrorBanner message={loadError} />}

      {/* Valuation & Stock Health Stats */}
      {!loading && products.length > 0 && (
        <InventoryValuationWidget products={products} />
      )}

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
          <span>Stock Crítico (≤ 3)</span>
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

      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-muted)]"
          />
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Buscar producto... (/)"
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
            className="admin-input pl-9 w-full text-xs"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="admin-input flex-1 min-w-[160px] w-auto text-xs"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <AdminButton
          variant="secondary"
          onClick={() => setBulkPriceOpen(true)}
          className="whitespace-nowrap"
        >
          <Zap size={14} className="text-[var(--dash-accent)] mr-1" />
          Ajuste Masivo
        </AdminButton>
        <AdminButton onClick={() => setCreating(true)} className="whitespace-nowrap">
          <Plus size={15} />
          Nuevo producto
        </AdminButton>
      </div>

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
      ) : (
        <ProductsTable
          data={filteredProducts}
          onEdit={setEditingProduct}
          onDuplicate={handleDuplicate}
          onDelete={setDeletingProduct}
          onStockChange={handleStockChange}
        />
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
          onSave={async (input) => {
            await handleCreate(input);
            setCreating(false);
          }}
          onCancel={() => setCreating(false)}
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
  onEdit,
  onDuplicate,
  onDelete,
  onStockChange,
}: {
  data: Product[];
  onEdit: (product: Product) => void;
  onDuplicate?: (product: Product) => void;
  onDelete: (product: Product) => void;
  onStockChange: (product: Product, next: number) => Promise<void>;
}) {
  return (
    <>
      {/* Desktop — full table with an inline stock stepper per row */}
      <div className="admin-desktop-only overflow-x-auto max-h-[70vh]">
        <table className="admin-table w-full text-sm border-collapse">
          <thead>
            <tr>
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
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onStockChange={onStockChange}
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
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onStockChange={onStockChange}
          />
        ))}
      </div>
    </>
  );
}
