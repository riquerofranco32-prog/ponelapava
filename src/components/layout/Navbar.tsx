"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/#el-local", label: "El local" },
  { href: "/#contacto", label: "Contacto" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { itemCount, toggleDrawer } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-pava-cream/95 backdrop-blur-md shadow-sm border-b border-pava-brown/10"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex flex-col leading-none group"
              aria-label="Poné La Pava — Inicio"
            >
              <span
                className={cn(
                  "font-display text-xl lg:text-2xl font-bold tracking-tight transition-colors duration-200",
                  isScrolled ? "text-pava-green" : "text-pava-cream"
                )}
              >
                Poné La Pava
              </span>
              <span
                className={cn(
                  "text-[10px] tracking-[0.2em] uppercase font-medium transition-colors duration-200",
                  isScrolled ? "text-pava-brown-mid" : "text-pava-cream/70"
                )}
              >
                Yerbas & Accesorios
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8" role="navigation" aria-label="Navegación principal">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "nav-link text-sm font-medium tracking-wide transition-colors duration-200",
                    isScrolled
                      ? "text-pava-brown hover:text-pava-green"
                      : "text-pava-cream/90 hover:text-pava-cream"
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {/* Cart button */}
              <button
                onClick={toggleDrawer}
                className={cn(
                  "relative flex items-center justify-center w-10 h-10 transition-colors duration-200",
                  isScrolled
                    ? "text-pava-brown hover:text-pava-green"
                    : "text-pava-cream hover:text-pava-cream/70"
                )}
                aria-label={`Carrito, ${itemCount} productos`}
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 bg-pava-terracotta text-white text-[10px] font-bold rounded-full">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>

              {/* Ver catálogo CTA */}
              <Link
                href="/catalogo"
                className={cn(
                  "hidden lg:flex items-center gap-2 px-5 py-2.5 text-sm font-medium tracking-wide transition-all duration-200 border-2",
                  isScrolled
                    ? "bg-pava-green text-pava-cream border-pava-green hover:bg-pava-green-light"
                    : "bg-pava-cream text-pava-green border-pava-cream hover:bg-pava-cream/90"
                )}
              >
                Ver catálogo
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className={cn(
                  "flex lg:hidden items-center justify-center w-10 h-10 transition-colors duration-200",
                  isScrolled
                    ? "text-pava-brown hover:text-pava-green"
                    : "text-pava-cream hover:text-pava-cream/70"
                )}
                aria-label={isMobileOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={isMobileOpen}
              >
                {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-all duration-300",
          isMobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-pava-brown/60 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />

        {/* Panel */}
        <div
          className={cn(
            "absolute top-0 right-0 h-full w-72 bg-pava-cream shadow-2xl transition-transform duration-300 flex flex-col",
            isMobileOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-pava-brown/10">
            <span className="font-display text-lg font-bold text-pava-green">
              Menú
            </span>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="text-pava-brown hover:text-pava-green transition-colors"
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 flex flex-col px-6 py-6 gap-1" role="navigation" aria-label="Menú mobile">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="py-3 px-2 text-base font-medium text-pava-brown hover:text-pava-green border-b border-pava-brown/10 transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="px-6 pb-8">
            <Link
              href="/catalogo"
              className="flex items-center justify-center w-full py-3 bg-pava-green text-pava-cream text-sm font-medium tracking-wide border-2 border-pava-green hover:bg-pava-green-light transition-colors duration-200"
            >
              Ver catálogo
            </Link>
            <a
              href="https://wa.me/5491100000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full py-3 mt-3 bg-[#25D366] text-white text-sm font-medium tracking-wide border-2 border-[#25D366] hover:bg-[#1ebe5d] transition-colors duration-200"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
