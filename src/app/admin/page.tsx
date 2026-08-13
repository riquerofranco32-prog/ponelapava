"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Search,
} from "lucide-react";
import { Product } from "@/types";
import { ProductInput } from "@/lib/products";
import { formatPrice, getCategoryLabel } from "@/lib/utils";
import ProductForm from "@/components/admin/ProductForm";
import AdminShell, { AdminNavItem } from "@/components/admin/AdminShell";
import { AdminButton } from "@/components/admin/AdminButton";
import DashboardStats from "@/components/admin/DashboardStats";
import OrdersTable from "@/components/admin/OrdersTable";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  async function loadProducts() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/products");
      if (!res.ok) throw new Error("No se pudieron cargar los productos");
      setProducts(await res.json());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleCreate(input: ProductInput) {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("No se pudo crear el producto");
    setCreating(false);
    await loadProducts();
  }

  async function handleUpdate(id: string, input: ProductInput) {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("No se pudo actualizar el producto");
    setEditingProduct(null);
    await loadProducts();
  }

  async function handleDelete(product: Product) {
    if (
      !confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)
    ) {
      return;
    }
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("No se pudo eliminar el producto");
      return;
    }
    await loadProducts();
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchProduct.toLowerCase()),
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <KpiCard
              label="Total de productos"
              value={loading ? "…" : products.length}
            />
            <KpiCard
              label="Destacados"
              value={loading ? "…" : products.filter((p) => p.featured).length}
            />
            <KpiCard
              label="Agotados"
              value={
                loading
                  ? "…"
                  : products.filter((p) => p.status === "out_of_stock").length
              }
            />
          </div>

          <Card>
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
              onDelete={handleDelete}
            />
          </Card>
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
                type="search"
                placeholder="Buscar producto..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="admin-input"
                style={{ paddingLeft: 36 }}
              />
            </div>
            <AdminButton onClick={() => setCreating(true)}>
              <Plus size={15} />
              Nuevo producto
            </AdminButton>
          </div>

          {loading ? (
            <p style={{ fontSize: 14, color: "var(--dash-muted)" }}>
              Cargando productos...
            </p>
          ) : (
            <ProductsTable
              data={filteredProducts}
              onEdit={setEditingProduct}
              onDelete={handleDelete}
            />
          )}
        </div>
      )}

      {/* ── CATEGORIAS ── */}
      {activeSection === "categorias" && (
        <EmptyState
          icon={Tag}
          title="Gestión de categorías"
          description="Las categorías están definidas en el código del sitio. Gestión editable próximamente."
        />
      )}

      {/* ── PEDIDOS ── */}
      {activeSection === "pedidos" && <OrdersTable />}

      {/* ── CONFIGURACIÓN ── */}
      {activeSection === "configuracion" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Nombre del negocio", value: "Poné La Pava" },
            { label: "Número de WhatsApp", value: "+54 9 2994 65-0177" },
            {
              label: "Dirección del local",
              value: "Avenida San Martín 475, Catriel, Río Negro",
            },
            { label: "Horarios", value: "Lun–Vie: 9–19 · Sáb: 9–14" },
          ].map(({ label, value }) => (
            <Card key={label}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "var(--dash-muted)",
                  marginBottom: 8,
                }}
              >
                {label}
              </label>
              <input
                type="text"
                defaultValue={value}
                readOnly
                className="admin-input"
              />
              <p
                style={{
                  fontSize: 12,
                  color: "var(--dash-muted)",
                  marginTop: 8,
                }}
              >
                Definido en src/lib/site.ts y src/lib/whatsapp.ts — edición
                desde acá, próximamente.
              </p>
            </Card>
          ))}
        </div>
      )}

      {creating && (
        <ProductForm
          onSave={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}
      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onSave={(input) => handleUpdate(editingProduct.id, input)}
          onCancel={() => setEditingProduct(null)}
        />
      )}
    </AdminShell>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--dash-surface)",
        border: "1px solid var(--dash-border)",
        borderRadius: 12,
        padding: 20,
      }}
    >
      {children}
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <span
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--dash-muted)",
          marginBottom: 10,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontSize: 30,
          fontWeight: 700,
          color: "var(--dash-text)",
        }}
      >
        {value}
      </span>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        background: "var(--dash-surface)",
        border: "1px solid var(--dash-border)",
        borderRadius: 12,
        padding: 40,
        textAlign: "center",
      }}
    >
      <Icon
        size={32}
        style={{ margin: "0 auto 16px", color: "var(--dash-muted)" }}
      />
      <h2
        style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 8,
          color: "var(--dash-text)",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "var(--dash-muted)",
          maxWidth: 420,
          margin: "0 auto",
        }}
      >
        {description}
      </p>
    </div>
  );
}

function ProductsTable({
  data,
  compact = false,
  onEdit,
  onDelete,
}: {
  data: Product[];
  compact?: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
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
  const td: React.CSSProperties = {
    padding: "12px 14px",
    borderTop: "1px solid var(--dash-border)",
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th style={th}>Producto</th>
            {!compact && <th style={th}>Categoría</th>}
            <th style={th}>Precio</th>
            <th style={th}>Estado</th>
            <th style={{ ...th, textAlign: "right" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((product) => (
            <tr key={product.id}>
              <td style={td}>
                <span style={{ fontWeight: 500, color: "var(--dash-text)" }}>
                  {product.name}
                </span>
                {!compact && product.brand && (
                  <span
                    style={{
                      display: "block",
                      fontSize: 12,
                      color: "var(--dash-muted)",
                      marginTop: 2,
                    }}
                  >
                    {product.brand}
                  </span>
                )}
              </td>
              {!compact && (
                <td style={{ ...td, color: "var(--dash-muted)" }}>
                  {getCategoryLabel(product.category)}
                </td>
              )}
              <td style={{ ...td, fontWeight: 500, color: "var(--dash-text)" }}>
                {formatPrice(product.price)}
              </td>
              <td style={td}>
                <StatusBadge status={product.status} />
              </td>
              <td style={{ ...td, textAlign: "right" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 6,
                  }}
                >
                  <IconButton
                    onClick={() => onEdit(product)}
                    title="Editar"
                    icon={Edit2}
                  />
                  <IconButton
                    onClick={() => onDelete(product)}
                    title="Eliminar"
                    icon={Trash2}
                    danger
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: Product["status"] }) {
  const map = {
    available: {
      label: "Disponible",
      color: "var(--dash-success)",
      bg: "var(--dash-success-bg)",
    },
    featured: {
      label: "Destacado",
      color: "var(--dash-accent)",
      bg: "rgba(199,166,122,0.12)",
    },
    out_of_stock: {
      label: "Agotado",
      color: "var(--dash-danger)",
      bg: "var(--dash-danger-bg)",
    },
  } as const;
  const { label, color, bg } = map[status];
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color,
        background: bg,
      }}
    >
      {label}
    </span>
  );
}

function IconButton({
  onClick,
  title,
  icon: Icon,
  danger = false,
}: {
  onClick: () => void;
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 30,
        height: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        background: "var(--dash-surface-2)",
        border: "1px solid var(--dash-border)",
        color: danger ? "var(--dash-danger)" : "var(--dash-muted)",
        cursor: "pointer",
      }}
    >
      <Icon size={13} />
    </button>
  );
}
