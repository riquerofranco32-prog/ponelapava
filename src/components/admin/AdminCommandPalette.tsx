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
  Sparkles,
} from "lucide-react";
import { Product } from "@/types";
import { useAdminUser } from "@/context/AdminUserContext";

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
  const { isStaff } = useAdminUser();
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
      id: "nav-marketing",
      title: "Landing & Fotos",
      subtitle: "Personalizar portada hero, promos y galería Instagram",
      category: "Navegación",
      icon: Sparkles,
      action: () => {
        router.push("/admin/marketing");
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

  const effectiveNavCommands = isStaff
    ? navCommands.filter(
        (c) =>
          c.id !== "nav-coupons" &&
          c.id !== "nav-settings" &&
          c.id !== "nav-reports"
      )
    : navCommands;

  const allFiltered: CommandItem[] = query.trim()
    ? [
        ...effectiveNavCommands.filter((c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.subtitle?.toLowerCase().includes(query.toLowerCase()),
        ),
        ...productCommands,
        ...actionCommands.filter((c) =>
          c.title.toLowerCase().includes(query.toLowerCase()),
        ),
      ]
    : [...effectiveNavCommands, ...actionCommands];

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
      className="fixed inset-0 z-[100] flex justify-center px-4 pt-[12vh] bg-black/65 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Búsqueda rápida en el panel"
        className="w-full max-w-[580px] bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[var(--dash-radius-lg)] shadow-2xl overflow-hidden flex flex-col h-fit max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--dash-border)]">
          <Search size={18} className="text-[var(--dash-accent)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar páginas, productos, clientes..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            className="flex-1 bg-transparent border-0 outline-none text-[var(--dash-text)] text-sm font-medium min-w-0 placeholder:text-[var(--dash-muted)]"
          />
          <kbd className="text-xs px-1.5 py-0.5 rounded bg-[var(--dash-surface-2)] border border-[var(--dash-border)] text-[var(--dash-muted)] font-mono shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2">
          {allFiltered.length === 0 ? (
            <div className="py-8 px-4 text-center text-[var(--dash-muted)] text-sm">
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--dash-radius-md)] cursor-pointer transition-colors ${
                    isSelected ? "bg-[var(--dash-surface-2)]" : "bg-transparent"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-[var(--dash-radius-sm)] flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-[var(--dash-accent-subtle)] text-[var(--dash-accent)]"
                        : "bg-[var(--dash-surface-2)] text-[var(--dash-muted)]"
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--dash-text)] truncate">
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div className="text-xs text-[var(--dash-muted)] truncate">
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs uppercase tracking-wider text-[var(--dash-muted)] bg-[var(--dash-surface)] px-1.5 py-0.5 rounded-[var(--dash-radius-sm)] border border-[var(--dash-border)] font-medium">
                      {item.category}
                    </span>
                    {isSelected && (
                      <ArrowRight size={14} className="text-[var(--dash-accent)]" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-[var(--dash-surface-2)] border-t border-[var(--dash-border)] flex items-center justify-between text-xs text-[var(--dash-muted)]">
          <span className="hidden sm:inline">
            Navegá con <kbd className="px-1 py-0.5 border border-[var(--dash-border)] rounded">↑</kbd> <kbd className="px-1 py-0.5 border border-[var(--dash-border)] rounded">↓</kbd> y seleccioná con <kbd className="px-1 py-0.5 border border-[var(--dash-border)] rounded">↵</kbd>
          </span>
          <span className="sm:hidden">
            Tocá cualquier opción para abrir
          </span>
          <span className="font-medium text-[var(--dash-text)]">Poné La Pava Admin</span>
        </div>
      </div>
    </div>
  );
}
