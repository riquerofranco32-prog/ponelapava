"use client";

import { useRef, useState, useEffect } from "react";
import { Plus, Search, PackageSearch } from "lucide-react";
import { Product } from "@/types";
import ProductForm from "@/components/admin/ProductForm";
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
    <div>
      {loadError && <AdminErrorBanner message={loadError} />}

      {/* Valuation & Stock Health Stats */}
      {!loading && products.length > 0 && (
        <InventoryValuationWidget products={products} />
      )}

      {/* Quick Stock Status Filter Chips */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        <button
          type="button"
          onClick={() => setStockFilter("all")}
          style={{
            padding: "6px 12px",
            borderRadius: "var(--radius-chip)",
            border:
              stockFilter === "all"
                ? "1px solid var(--dash-accent)"
                : "1px solid var(--dash-border)",
            background:
              stockFilter === "all"
                ? "var(--dash-accent-subtle)"
                : "var(--dash-surface)",
            color:
              stockFilter === "all"
                ? "var(--dash-accent)"
                : "var(--dash-text-muted)",
            fontSize: 12,
            fontWeight: stockFilter === "all" ? 600 : 500,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>Todos</span>
          <span
            style={{
              fontSize: 11,
              opacity: 0.75,
              background: "var(--dash-surface-elevated)",
              padding: "1px 5px",
              borderRadius: 3,
            }}
          >
            {products.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStockFilter("low")}
          style={{
            padding: "6px 12px",
            borderRadius: "var(--radius-chip)",
            border:
              stockFilter === "low"
                ? "1px solid #f59e0b"
                : "1px solid var(--dash-border)",
            background:
              stockFilter === "low"
                ? "rgba(245, 158, 11, 0.15)"
                : "var(--dash-surface)",
            color: stockFilter === "low" ? "#d97706" : "var(--dash-text-muted)",
            fontSize: 12,
            fontWeight: stockFilter === "low" ? 600 : 500,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>⚠️ Stock Crítico (≤ 3)</span>
          {lowStockCount > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: "#f59e0b",
                color: "#fff",
                padding: "1px 6px",
                borderRadius: 999,
              }}
            >
              {lowStockCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setStockFilter("out")}
          style={{
            padding: "6px 12px",
            borderRadius: "var(--radius-chip)",
            border:
              stockFilter === "out"
                ? "1px solid var(--dash-danger)"
                : "1px solid var(--dash-border)",
            background:
              stockFilter === "out"
                ? "rgba(220, 38, 38, 0.15)"
                : "var(--dash-surface)",
            color:
              stockFilter === "out"
                ? "var(--dash-danger)"
                : "var(--dash-text-muted)",
            fontSize: 12,
            fontWeight: stockFilter === "out" ? 600 : 500,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>⛔ Sin Stock</span>
          {outOfStockCount > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: "var(--dash-danger)",
                color: "#fff",
                padding: "1px 6px",
                borderRadius: 999,
              }}
            >
              {outOfStockCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setStockFilter("available")}
          style={{
            padding: "6px 12px",
            borderRadius: "var(--radius-chip)",
            border:
              stockFilter === "available"
                ? "1px solid #10b981"
                : "1px solid var(--dash-border)",
            background:
              stockFilter === "available"
                ? "rgba(16, 185, 129, 0.15)"
                : "var(--dash-surface)",
            color:
              stockFilter === "available"
                ? "#059669"
                : "var(--dash-text-muted)",
            fontSize: 12,
            fontWeight: stockFilter === "available" ? 600 : 500,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>✅ En Stock</span>
          <span
            style={{
              fontSize: 11,
              opacity: 0.75,
              background: "var(--dash-surface-elevated)",
              padding: "1px 5px",
              borderRadius: 3,
            }}
          >
            {inStockCount}
          </span>
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--dash-muted)",
            }}
          />
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Buscar producto... (/)"
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
            className="admin-input"
            style={{ paddingLeft: 36 }}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="admin-input"
          style={{ width: "auto", minWidth: 160 }}
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <AdminButton onClick={() => setCreating(true)}>
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
  const th: React.CSSProperties = {
    textAlign: "left",
    padding: "10px 14px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--dash-muted)",
  };

  return (
    <>
      {/* Desktop — full table with an inline stock stepper per row */}
      <div
        className="admin-desktop-only"
        style={{ overflowX: "auto", maxHeight: "70vh" }}
      >
        <table
          className="admin-table"
          style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th style={th}>Producto</th>
              <th style={th}>Categoría</th>
              <th style={th}>Precio</th>
              <th style={th}>Stock</th>
              <th style={th}>Estado</th>
              <th style={{ ...th, textAlign: "right" }}>Acciones</th>
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
      <div
        className="admin-mobile-only"
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
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
