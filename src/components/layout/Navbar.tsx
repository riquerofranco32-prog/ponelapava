"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "border-b border-pava-brown/10 bg-pava-cream/95 shadow-[0_8px_28px_-18px_rgba(28,18,9,0.65)] backdrop-blur-md"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-[4.5rem] items-center justify-between lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="group flex flex-col leading-none"
              aria-label="Poné La Pava — Inicio"
            >
              <span
                className={cn(
                  "font-display text-xl font-bold tracking-tight transition-colors duration-200 lg:text-2xl",
                  isScrolled ? "text-pava-green" : "text-pava-cream"
                )}
              >
                Poné La Pava
              </span>
              <span
                className={cn(
                  "mt-1 text-[9px] font-semibold uppercase tracking-[0.23em] transition-colors duration-200",
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
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Cart button */}
              <button
                onClick={toggleDrawer}
                className={cn(
                  "relative flex h-11 w-11 items-center justify-center border transition-colors duration-200",
                  isScrolled
                    ? "border-pava-brown/10 text-pava-brown hover:border-pava-green/30 hover:text-pava-green"
                    : "border-pava-cream/25 text-pava-cream hover:border-pava-cream/60 hover:text-pava-cream/70"
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
                  "hidden lg:flex items-center gap-2 border px-5 py-3 text-sm font-semibold tracking-wide transition-all duration-200",
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
                  "flex h-11 w-11 items-center justify-center border transition-colors duration-200 lg:hidden",
                  isScrolled
                    ? "border-pava-brown/10 text-pava-brown hover:border-pava-green/30 hover:text-pava-green"
                    : "border-pava-cream/25 text-pava-cream hover:border-pava-cream/60 hover:text-pava-cream/70"
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
            "absolute top-0 right-0 flex h-full w-[86vw] max-w-sm flex-col bg-pava-cream shadow-2xl transition-transform duration-300",
            isMobileOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-pava-brown/10 px-6 py-6">
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
                onClick={() => setIsMobileOpen(false)}
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
              className="flex w-full items-center justify-center border-2 border-pava-green bg-pava-green py-3.5 text-sm font-semibold tracking-wide text-pava-cream transition-colors duration-200 hover:bg-pava-green-light"
            >
              Ver catálogo
            </Link>
            <a
              href="https://wa.me/5491100000000"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center border-2 border-[#25D366] bg-[#25D366] py-3.5 text-sm font-semibold tracking-wide text-white transition-colors duration-200 hover:bg-[#1ebe5d]"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
