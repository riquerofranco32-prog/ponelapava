import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  TicketPercent,
  Users,
  Settings,
  History,
  BarChart3,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  name: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    name: "Operación",
    items: [
      { href: "/admin/dashboard", label: "Hoy", icon: LayoutDashboard },
      { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
      { href: "/admin/clientes", label: "Clientes", icon: Users },
    ],
  },
  {
    name: "Catálogo",
    items: [
      { href: "/admin/productos", label: "Productos", icon: Package },
      { href: "/admin/categorias", label: "Categorías", icon: Tag },
    ],
  },
  {
    name: "Crecimiento",
    items: [
      { href: "/admin/marketing", label: "Marketing", icon: Sparkles },
      { href: "/admin/cupones", label: "Cupones", icon: TicketPercent },
      { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
    ],
  },
  {
    name: "Sistema",
    items: [
      { href: "/admin/actividad", label: "Actividad", icon: History },
      { href: "/admin/configuracion", label: "Configuración", icon: Settings },
    ],
  },
];

export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap(
  (group) => group.items
);

