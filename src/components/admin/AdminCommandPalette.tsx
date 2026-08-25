"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  TicketPercent,
  BarChart3,
  Users,
  History,
  Settings,
  ExternalLink,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Product } from "@/types";

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "Navegación" | "Productos" | "Acciones Rápidas";
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  action: () => void;
}

interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminCommandPalette({
  isOpen,
  onClose,
}: AdminCommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);

      // Lazy load products for search
      if (products.length === 0 && !loadingProducts) {
        setLoadingProducts(true);
        fetch("/api/admin/products")
          .then((res) => (res.ok ? res.json() : []))
          .then((data) => setProducts(data))
          .catch(() => {})
          .finally(() => setLoadingProducts(false));
      }
    }
  }, [isOpen]);

  // Keyboard shortcut listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open triggered by parent or global listener
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const navCommands: CommandItem[] = [
    {
      id: "nav-dashboard",
      title: "Dashboard",
      subtitle: "Métricas principales y accesos directos",
      category: "Navegación",
      icon: LayoutDashboard,
      action: () => {
        router.push("/admin/dashboard");
        onClose();
      },
    },
    {
      id: "nav-products",
      title: "Productos",
      subtitle: "Inventario, precios y stock",
      category: "Navegación",
      icon: Package,
      action: () => {
        router.push("/admin/productos");
        onClose();
      },
    },
    {
      id: "nav-categories",
      title: "Categorías",
      subtitle: "Organización del catálogo",
      category: "Navegación",
      icon: Tag,
      action: () => {
        router.push("/admin/categorias");
        onClose();
      },
    },
    {
      id: "nav-orders",
      title: "Pedidos",
      subtitle: "Órdenes de clientes y estados",
      category: "Navegación",
      icon: ShoppingCart,
      action: () => {
        router.push("/admin/pedidos");
        onClose();
      },
    },
    {
      id: "nav-coupons",
      title: "Cupones",
      subtitle: "Descuentos y códigos promocionales",
      category: "Navegación",
      icon: TicketPercent,
      action: () => {
        router.push("/admin/cupones");
        onClose();
      },
    },
    {
      id: "nav-reports",
      title: "Reportes",
      subtitle: "Ventas por período y horarios pico",
      category: "Navegación",
      icon: BarChart3,
      action: () => {
        router.push("/admin/reportes");
        onClose();
      },
    },
    {
      id: "nav-customers",
      title: "Clientes",
      subtitle: "CRM, historial y WhatsApp",
      category: "Navegación",
      icon: Users,
      action: () => {
        router.push("/admin/clientes");
        onClose();
      },
    },
    {
      id: "nav-activity",
      title: "Actividad y Auditoría",
      subtitle: "Historial de cambios del sistema",
      category: "Navegación",
      icon: History,
      action: () => {
        router.push("/admin/actividad");
        onClose();
      },
    },
    {
      id: "nav-settings",
      title: "Configuración",
      subtitle: "Ajustes de tienda y WhatsApp",
      category: "Navegación",
      icon: Settings,
      action: () => {
        router.push("/admin/configuracion");
        onClose();
      },
    },
  ];

  const actionCommands: CommandItem[] = [
    {
      id: "action-new-product",
      title: "Nuevo producto",
      subtitle: "Cargar un producto nuevo al catálogo",
      category: "Acciones Rápidas",
      icon: Plus,
      action: () => {
        router.push("/admin/productos?action=new");
        onClose();
      },
    },
    {
      id: "action-view-site",
      title: "Ver tienda online",
      subtitle: "Abrir la landing de Poné La Pava",
      category: "Acciones Rápidas",
      icon: ExternalLink,
      action: () => {
        window.open("/", "_blank");
        onClose();
      },
    },
  ];

  // Filter products by query
  const productCommands: CommandItem[] = products
    .filter((p) => {
      const q = query.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    })
    .slice(0, 8)
    .map((p) => ({
      id: `prod-${p.id}`,
      title: p.name,
      subtitle: `${p.brand ? `${p.brand} • ` : ""}$${p.price.toLocaleString("es-AR")} • Stock: ${p.stock}`,
      category: "Productos",
      icon: Package,
      action: () => {
        router.push(`/admin/productos?search=${encodeURIComponent(p.name)}`);
        onClose();
      },
    }));

  const allFiltered: CommandItem[] = query.trim()
    ? [
        ...navCommands.filter((c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.subtitle?.toLowerCase().includes(query.toLowerCase()),
        ),
        ...productCommands,
        ...actionCommands.filter((c) =>
          c.title.toLowerCase().includes(query.toLowerCase()),
        ),
      ]
    : [...navCommands, ...actionCommands];

  // Handle keyboard navigation
  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < allFiltered.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : allFiltered.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (allFiltered[selectedIndex]) {
        allFiltered[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
        background: "rgba(10, 15, 12, 0.65)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Búsqueda rápida en el panel"
        style={{
          width: "100%",
          maxWidth: 580,
          background: "var(--dash-surface)",
          border: "1px solid var(--dash-border)",
          borderRadius: "var(--radius-card)",
          boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 18px",
            borderBottom: "1px solid var(--dash-border)",
          }}
        >
          <Search size={18} style={{ color: "var(--dash-accent)" }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar páginas, productos, clientes o acciones... (↑↓ para navegar)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--dash-text)",
              fontSize: 15,
              fontWeight: 500,
            }}
          />
          <kbd
            style={{
              fontSize: 11,
              padding: "2px 6px",
              borderRadius: 4,
              background: "var(--dash-surface-elevated)",
              border: "1px solid var(--dash-border)",
              color: "var(--dash-text-muted)",
              fontFamily: "monospace",
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          style={{
            maxHeight: 380,
            overflowY: "auto",
            padding: "8px",
          }}
        >
          {allFiltered.length === 0 ? (
            <div
              style={{
                padding: "32px 16px",
                textAlign: "center",
                color: "var(--dash-text-muted)",
                fontSize: 14,
              }}
            >
              No se encontraron resultados para &ldquo;{query}&rdquo;
            </div>
          ) : (
            allFiltered.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: "var(--radius-control)",
                    background: isSelected
                      ? "var(--dash-surface-elevated)"
                      : "transparent",
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isSelected
                        ? "var(--dash-accent-subtle)"
                        : "var(--dash-surface-elevated)",
                      color: isSelected
                        ? "var(--dash-accent)"
                        : "var(--dash-text-muted)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--dash-text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--dash-text-muted)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "var(--dash-text-muted)",
                        background: "var(--dash-surface)",
                        padding: "2px 6px",
                        borderRadius: 4,
                        border: "1px solid var(--dash-border)",
                      }}
                    >
                      {item.category}
                    </span>
                    {isSelected && (
                      <ArrowRight
                        size={14}
                        style={{ color: "var(--dash-accent)" }}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: "8px 16px",
            background: "var(--dash-surface-elevated)",
            borderTop: "1px solid var(--dash-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 11,
            color: "var(--dash-text-muted)",
          }}
        >
          <span>
            Navegá con <kbd style={{ padding: "1px 4px", border: "1px solid var(--dash-border)", borderRadius: 3 }}>↑</kbd> <kbd style={{ padding: "1px 4px", border: "1px solid var(--dash-border)", borderRadius: 3 }}>↓</kbd> y seleccioná con <kbd style={{ padding: "1px 4px", border: "1px solid var(--dash-border)", borderRadius: 3 }}>↵</kbd>
          </span>
          <span>Poné La Pava Admin</span>
        </div>
      </div>
    </div>
  );
}
