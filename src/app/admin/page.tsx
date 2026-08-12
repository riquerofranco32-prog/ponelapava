"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Settings,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Search,
  Database,
} from "lucide-react";
import { products } from "@/data/products";
import { formatPrice, getCategoryLabel } from "@/lib/utils";

type AdminSection = "dashboard" | "productos" | "categorias" | "pedidos" | "configuracion";

const mockMetrics = [
  {
    label: "Total de productos",
    value: 20,
    icon: Package,
    trend: "up" as const,
    change: "+3 este mes",
  },
  {
    label: "Pedidos del mes",
    value: 47,
    icon: ShoppingCart,
    trend: "up" as const,
    change: "+12% vs anterior",
  },
  {
    label: "Productos agotados",
    value: 1,
    icon: AlertTriangle,
    trend: "neutral" as const,
    change: "Revisar stock",
  },
  {
    label: "Pedidos pendientes",
    value: 8,
    icon: Clock,
    trend: "down" as const,
    change: "-2 hoy",
  },
];

const navItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "productos" as const, label: "Productos", icon: Package },
  { id: "categorias" as const, label: "Categorías", icon: Tag },
  { id: "pedidos" as const, label: "Pedidos", icon: ShoppingCart },
  { id: "configuracion" as const, label: "Configuración", icon: Settings },
];

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [searchProduct, setSearchProduct] = useState("");

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-pava-cream-dark">
      {/* Sidebar */}
      <aside className="w-60 bg-pava-brown text-pava-cream flex flex-col shrink-0">
        {/* Brand */}
        <div className="px-5 py-6 border-b border-pava-cream/10">
          <Link href="/" className="block">
            <span className="font-display text-lg font-bold text-pava-cream">
              Poné La Pava
            </span>
            <span className="block text-[10px] tracking-[0.2em] uppercase text-pava-cream/40 mt-0.5">
              Panel Admin
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150 text-left ${
                activeSection === id
                  ? "bg-pava-cream/10 text-pava-cream border-l-2 border-pava-gold"
                  : "text-pava-cream/60 hover:text-pava-cream hover:bg-pava-cream/5 border-l-2 border-transparent"
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>

        {/* Supabase note */}
        <div className="px-4 py-4 border-t border-pava-cream/10">
          <div className="flex items-center gap-2 text-xs text-pava-cream/30">
            <Database size={13} />
            <span>Conectar Supabase (próx.)</span>
          </div>
        </div>

        {/* Back to site */}
        <div className="px-3 pb-5">
          <Link
            href="/"
            className="flex items-center justify-center w-full py-2 text-xs text-pava-cream/50 hover:text-pava-cream transition-colors border border-pava-cream/10 hover:border-pava-cream/30"
          >
            ← Ver sitio
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Topbar */}
        <div className="bg-white border-b border-pava-brown/8 px-8 py-4 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-pava-brown capitalize">
            {navItems.find((n) => n.id === activeSection)?.label}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-pava-brown/50">
              Datos de prueba — conectar Supabase para datos reales
            </span>
          </div>
        </div>

        <div className="px-8 py-8">
          {/* ── DASHBOARD ── */}
          {activeSection === "dashboard" && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {mockMetrics.map(({ label, value, icon: Icon, trend, change }) => (
                  <div
                    key={label}
                    className="bg-white border border-pava-brown/8 p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-pava-brown/50 font-medium uppercase tracking-wide">
                        {label}
                      </span>
                      <Icon size={18} className="text-pava-brown/30" />
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="font-display text-3xl font-bold text-pava-brown">
                        {value}
                      </span>
                      <div
                        className={`flex items-center gap-1 text-xs font-medium ${
                          trend === "up"
                            ? "text-pava-green"
                            : trend === "down"
                            ? "text-pava-terracotta"
                            : "text-pava-brown/50"
                        }`}
                      >
                        {trend === "up" && <TrendingUp size={13} />}
                        {trend === "down" && <TrendingDown size={13} />}
                        {change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-pava-brown/8 p-6">
                <h2 className="font-display text-lg font-bold text-pava-brown mb-4">
                  Últimos productos agregados
                </h2>
                <ProductsTable
                  data={products.slice(0, 5)}
                  compact
                />
              </div>
            </div>
          )}

          {/* ── PRODUCTOS ── */}
          {activeSection === "productos" && (
            <div>
              {/* Actions bar */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-pava-brown/40" />
                  <input
                    type="search"
                    placeholder="Buscar producto..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-pava-brown/15 text-pava-brown text-sm focus:outline-none focus:border-pava-green transition-colors"
                  />
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-pava-green text-pava-cream text-sm font-medium border-2 border-pava-green hover:bg-pava-green-light transition-colors">
                  <Plus size={15} />
                  Nuevo producto
                </button>
              </div>

              <ProductsTable data={filteredProducts} />
            </div>
          )}

          {/* ── CATEGORIAS ── */}
          {activeSection === "categorias" && (
            <div className="bg-white border border-pava-brown/8 p-8 text-center">
              <Tag size={32} className="mx-auto text-pava-brown/20 mb-4" />
              <h2 className="font-display text-xl font-bold text-pava-brown mb-2">
                Gestión de categorías
              </h2>
              <p className="text-pava-brown/50 text-sm max-w-md mx-auto">
                Esta sección se habilitará al conectar Supabase. Las categorías
                actuales están definidas en los datos estáticos.
              </p>
            </div>
          )}

          {/* ── PEDIDOS ── */}
          {activeSection === "pedidos" && (
            <div className="bg-white border border-pava-brown/8 p-8 text-center">
              <ShoppingCart size={32} className="mx-auto text-pava-brown/20 mb-4" />
              <h2 className="font-display text-xl font-bold text-pava-brown mb-2">
                Gestión de pedidos
              </h2>
              <p className="text-pava-brown/50 text-sm max-w-md mx-auto">
                Los pedidos actuales llegan por WhatsApp. Esta sección
                mostrará pedidos al conectar Supabase.
              </p>
            </div>
          )}

          {/* ── CONFIGURACIÓN ── */}
          {activeSection === "configuracion" && (
            <div className="space-y-5">
              {[
                { label: "Nombre del negocio", value: "Poné La Pava", placeholder: "Nombre..." },
                { label: "Número de WhatsApp", value: "+54 9 11 XXXX-XXXX", placeholder: "+549..." },
                { label: "Dirección del local", value: "Dirección a confirmar", placeholder: "Dirección..." },
                { label: "Horarios", value: "Lun–Vie: 9–19 · Sáb: 9–14", placeholder: "Horarios..." },
              ].map(({ label, value, placeholder }) => (
                <div key={label} className="bg-white border border-pava-brown/8 p-5">
                  <label className="block text-xs font-medium text-pava-brown/60 uppercase tracking-wide mb-2">
                    {label}
                  </label>
                  <input
                    type="text"
                    defaultValue={value}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 bg-pava-cream border border-pava-brown/15 text-pava-brown text-sm focus:outline-none focus:border-pava-green transition-colors"
                    readOnly
                  />
                  <p className="text-xs text-pava-brown/40 mt-1.5">
                    Editable al conectar Supabase
                  </p>
                </div>
              ))}
              <div className="bg-pava-cream-dark border border-pava-brown/8 p-4 flex items-center gap-3">
                <Database size={18} className="text-pava-brown/40 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-pava-brown">
                    Conectar Supabase
                  </p>
                  <p className="text-xs text-pava-brown/50 mt-0.5">
                    La configuración se guardará en la base de datos una vez conectada.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ProductsTable({
  data,
  compact = false,
}: {
  data: typeof products;
  compact?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-pava-brown/10">
            <th className="text-left py-3 px-4 text-xs font-semibold text-pava-brown/50 uppercase tracking-wide">
              Producto
            </th>
            {!compact && (
              <th className="text-left py-3 px-4 text-xs font-semibold text-pava-brown/50 uppercase tracking-wide">
                Categoría
              </th>
            )}
            <th className="text-left py-3 px-4 text-xs font-semibold text-pava-brown/50 uppercase tracking-wide">
              Precio
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-pava-brown/50 uppercase tracking-wide">
              Estado
            </th>
            {!compact && (
              <th className="text-right py-3 px-4 text-xs font-semibold text-pava-brown/50 uppercase tracking-wide">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((product) => (
            <tr
              key={product.id}
              className="border-b border-pava-brown/5 hover:bg-pava-cream-dark/50 transition-colors"
            >
              <td className="py-3 px-4">
                <span className="font-medium text-pava-brown line-clamp-1">
                  {product.name}
                </span>
                {!compact && (
                  <span className="block text-xs text-pava-brown/40 mt-0.5">
                    {product.brand}
                  </span>
                )}
              </td>
              {!compact && (
                <td className="py-3 px-4 text-pava-brown/60">
                  {getCategoryLabel(product.category)}
                </td>
              )}
              <td className="py-3 px-4 font-medium text-pava-brown">
                {formatPrice(product.price)}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${
                    product.status === "available"
                      ? "bg-pava-green/10 text-pava-green"
                      : product.status === "featured"
                      ? "bg-pava-gold/15 text-pava-gold"
                      : "bg-pava-terracotta/10 text-pava-terracotta"
                  }`}
                >
                  {product.status === "available"
                    ? "Disponible"
                    : product.status === "featured"
                    ? "Destacado"
                    : "Agotado"}
                </span>
              </td>
              {!compact && (
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="flex items-center justify-center w-7 h-7 text-pava-brown/40 hover:text-pava-green hover:bg-pava-green/10 transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="flex items-center justify-center w-7 h-7 text-pava-brown/40 hover:text-pava-terracotta hover:bg-pava-terracotta/10 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
