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

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: Tag },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/cupones", label: "Cupones", icon: TicketPercent },
  { href: "/admin/marketing", label: "Landing & Fotos", icon: Sparkles },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/actividad", label: "Actividad", icon: History },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];
