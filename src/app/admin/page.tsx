"use client";

import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Settings,
  Plus,
  Search,
  Star,
  AlertTriangle,
  PackageX,
} from "lucide-react";
import { Category, Product } from "@/types";
import { ProductInput } from "@/lib/products";
import { assertOk } from "@/lib/admin-fetch";
import ProductForm from "@/components/admin/ProductForm";
import CategoriesPanel from "@/components/admin/CategoriesPanel";
import AdminShell, { AdminNavItem } from "@/components/admin/AdminShell";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard, AdminKpiCard } from "@/components/admin/AdminCard";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { TableSkeleton, KpiSkeleton } from "@/components/admin/TableSkeleton";
import { ProductDesktopRow } from "@/components/admin/products/ProductDesktopRow";
import { ProductMobileCard } from "@/components/admin/products/ProductMobileCard";
import DashboardStats from "@/components/admin/DashboardStats";
import OrdersTable from "@/components/admin/OrdersTable";
import SettingsForm from "@/components/admin/SettingsForm";
import { useAdminToast } from "@/components/admin/AdminToast";

type AdminSection =
  "dashboard" | "productos" | "categorias" | "pedidos" | "configuracion";

const NAV_ITEMS: AdminNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "productos", label: "Productos", icon: Package },
  { id: "categorias", label: "Categorías", icon: Tag },
  { id: "pedidos", label: "Pedidos", icon: ShoppingCart },
  { id: "configuracion", label: "Configuración", icon: Settings },
];

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [searchProduct, setSearchProduct] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const showToast = useAdminToast();

  // `silent` skips the loading flag on refetches after a mutation — the
  // table already has data on screen, so flashing it back to a skeleton
  // on every save/delete reads as a glitch rather than a load.
  async function loadProducts(silent = false) {
    if (!silent) setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/products");
      assertOk(res, "No se pudieron cargar los productos");
      setProducts(await res.json());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function loadCategories() {
    const res = await fetch("/api/admin/categories");
    assertOk(res, "No se pudieron cargar las categorías");
    setCategories(await res.json());
  }

  useEffect(() => {
    loadProducts();
    loadCategories().catch((err) =>
      setLoadError(err instanceof Error ? err.message : "Error desconocido"),
    );
  }, []);

  // "/" jumps straight to the product search, mirroring the shortcut
  // shoppers already know from GitHub/Linear-style tools.
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key !== "/") return;
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (activeSection !== "productos") return;
      e.preventDefault();
      searchInputRef.current?.focus();
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [activeSection]);

  async function handleCreate(input: ProductInput) {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    assertOk(res, "No se pudo crear el producto");
    setCreating(false);
    await loadProducts(true);
    showToast("Producto creado");
  }

  async function handleUpdate(id: string, input: ProductInput) {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    assertOk(res, "No se pudo actualizar el producto");
    setEditingProduct(null);
    await loadProducts(true);
  }

  async function handleFormUpdate(id: string, input: ProductInput) {
    await handleUpdate(id, input);
    showToast("Producto actualizado");
  }

  // Mirrors ProductForm's stock/status link: 0 auto-marks out of stock,
  // restocking from 0 auto-clears it back to available.
  //
  // Rethrows on failure — StockStepper awaits this to know when to roll
  // its optimistic count back, so swallowing the error here would leave
  // the count wrong on screen with no toast to explain why.
  async function handleStockChange(product: Product, next: number) {
    const qty = Math.max(0, next);
    let status = product.status;
    if (qty <= 0 && status !== "out_of_stock") status = "out_of_stock";
    else if (qty > 0 && status === "out_of_stock") status = "available";

    const { id, createdAt: _createdAt, ...rest } = product;
    try {
      await handleUpdate(id, { ...rest, stock: qty, status });
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "No se pudo actualizar el stock",
        "error",
      );
      throw err;
    }
  }

  async function handleDelete(product: Product) {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "DELETE",
    });
    assertOk(res, "No se pudo eliminar el producto");
    setDeletingProduct(null);
    await loadProducts(true);
    showToast("Producto eliminado");
  }

  const filteredProducts = products.filter(
    (p) =>
      (categoryFilter === "all" || p.category === categoryFilter) &&
      (p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchProduct.toLowerCase())),
  );

  return (
    <AdminShell
      navItems={NAV_ITEMS}
      activeSection={activeSection}
      onSectionChange={(id) => setActiveSection(id as AdminSection)}
    >
      <h1
        style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 24,
          color: "var(--dash-text)",
          textTransform: "capitalize",
        }}
      >
        {NAV_ITEMS.find((n) => n.id === activeSection)?.label}
      </h1>

      {loadError && (
        <div
          style={{
            marginBottom: 20,
            background: "var(--dash-danger-bg)",
            border: "1px solid var(--dash-danger-border)",
            borderRadius: 8,
            padding: "12px 16px",
            fontSize: 14,
            color: "var(--dash-danger)",
          }}
        >
          {loadError}
        </div>
      )}

      {/* ── DASHBOARD ── */}
      {activeSection === "dashboard" && (
        <div>
          <DashboardStats />

          {loading ? (
            <KpiSkeleton count={4} />
          ) : (
            <div className="admin-kpi-grid">
              <AdminKpiCard
                icon={Package}
                label="Total de productos"
                value={products.length}
              />
              <AdminKpiCard
                icon={Star}
                label="Destacados"
                value={products.filter((p) => p.featured).length}
              />
              <AdminKpiCard
                icon={PackageX}
                label="Agotados"
                value={
                  products.filter((p) => p.status === "out_of_stock").length
                }
              />
              <AdminKpiCard
                icon={AlertTriangle}
                label="Stock bajo (≤5)"
                value={
                  products.filter((p) => p.stock > 0 && p.stock <= 5).length
                }
              />
            </div>
          )}

          <AdminCard>
            <h2
              style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 16,
                color: "var(--dash-text)",
              }}
            >
              Últimos productos
            </h2>
            <ProductsTable
              data={products.slice(0, 5)}
              compact
              onEdit={setEditingProduct}
              onDelete={setDeletingProduct}
              onStockChange={handleStockChange}
            />
          </AdminCard>
        </div>
      )}

      {/* ── PRODUCTOS ── */}
      {activeSection === "productos" && (
        <div>
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
          ) : (
            <ProductsTable
              data={filteredProducts}
              onEdit={setEditingProduct}
              onDelete={setDeletingProduct}
              onStockChange={handleStockChange}
            />
          )}
        </div>
      )}

      {/* ── CATEGORIAS ── */}
      {activeSection === "categorias" && (
        <CategoriesPanel
          categories={categories}
          products={products}
          onChange={loadCategories}
        />
      )}

      {/* ── PEDIDOS ── */}
      {activeSection === "pedidos" && <OrdersTable />}

      {/* ── CONFIGURACIÓN ── */}
      {activeSection === "configuracion" && <SettingsForm />}

      {creating && (
        <ProductForm
          categories={categories}
          onSave={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}
      {editingProduct && (
        <ProductForm
          categories={categories}
          product={editingProduct}
          onSave={(input) => handleFormUpdate(editingProduct.id, input)}
          onCancel={() => setEditingProduct(null)}
        />
      )}
      {deletingProduct && (
        <ConfirmDialog
          title="Eliminar producto"
          message={`¿Eliminar "${deletingProduct.name}"? Esta acción no se puede deshacer.`}
          onConfirm={() => handleDelete(deletingProduct)}
          onCancel={() => setDeletingProduct(null)}
        />
      )}
    </AdminShell>
  );
}

function ProductsTable({
  data,
  compact = false,
  onEdit,
  onDelete,
  onStockChange,
}: {
  data: Product[];
  compact?: boolean;
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
        style={{ overflowX: "auto", maxHeight: compact ? undefined : "70vh" }}
      >
        <table
          className="admin-table"
          style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th style={th}>Producto</th>
              {!compact && <th style={th}>Categoría</th>}
              <th style={th}>Precio</th>
              {!compact && <th style={th}>Stock</th>}
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
                compact={compact}
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
