export interface NavLink {
  href: string;
  label: string;
}

// Single source of truth for primary navigation, used by Navbar and Footer.
export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/seguimiento", label: "Seguimiento" },
  { href: "/ayuda", label: "Ayuda / Guías" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#el-local", label: "Nuestro Local" },
  { href: "/#contacto", label: "Contacto" },
];
