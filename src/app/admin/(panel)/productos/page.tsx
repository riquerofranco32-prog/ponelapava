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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const filteredProducts = products.filter(
    (p) =>
      (categoryFilter === "all" || p.category === categoryFilter) &&
      (p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchProduct.toLowerCase())),
  );

  return (
    <div>
      {loadError && <AdminErrorBanner message={loadError} />}

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
  onDelete,
  onStockChange,
}: {
  data: Product[];
  onEdit: (product: Product) => void;
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
            onDelete={onDelete}
            onStockChange={onStockChange}
          />
        ))}
      </div>
    </>
  );
}
