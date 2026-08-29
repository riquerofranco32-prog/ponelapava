"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, Search, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { cn } from "@/lib/utils";
import { InstagramIcon } from "@/components/ui/icons";
import { NAV_LINKS, UTILITY_LINKS } from "@/lib/nav";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/lib/site";
import { whatsappChatUrl } from "@/lib/whatsapp";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import TopAnnouncementBar from "@/components/layout/TopAnnouncementBar";
import StoreSearchModal from "@/components/layout/StoreSearchModal";

export default function Navbar() {
  const pathname = usePathname();
  const settings = useSiteSettings();
  const hasHero = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const isScrolled = hasHero ? scrolled : true;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { itemCount, toggleDrawer } = useCart();
  const { favoriteIds, toggleDrawer: toggleFavoritesDrawer } = useFavorites();

  useEffect(() => {
    if (!hasHero) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasHero]);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" &&
          !(
            e.target instanceof HTMLInputElement ||
            e.target instanceof HTMLTextAreaElement ||
            (e.target instanceof HTMLElement && e.target.isContentEditable)
          ))
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <StoreSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "border-b border-pava-brown/10 bg-pava-cream/98 backdrop-blur-md shadow-sm text-pava-brown"
            : "bg-transparent text-pava-cream",
        )}
      >
        <TopAnnouncementBar />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-300">
          <div
            className={cn(
              "flex items-center justify-between transition-all duration-300",
              isScrolled ? "h-16 lg:h-[4.25rem]" : "h-20 lg:h-22",
            )}
          >
            {/* Logo */}
            <Link
              href="/"
              className="group flex items-center gap-2.5 shrink-0"
              aria-label="Poné La Pava — Inicio"
            >
              <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-full lg:h-10 lg:w-10">
                <Image
                  src="/logo.png"
                  alt="Poné La Pava"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </span>
              <span className="flex flex-col leading-none">
                <span
                  className={cn(
                    "font-display font-bold tracking-tight transition-all duration-300",
                    isScrolled
                      ? "text-xl text-pava-green lg:text-[1.35rem]"
                      : "text-2xl text-pava-cream lg:text-[1.55rem]",
                  )}
                >
                  Poné La Pava
                </span>
                <span
                  className={cn(
                    "mt-0.5 text-[8.5px] font-semibold uppercase tracking-[0.24em] transition-colors duration-300",
                    isScrolled
                      ? "text-pava-brown-mid/70"
                      : "text-pava-cream/65",
                  )}
                >
                  Yerbas &amp; Accesorios
                </span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav
              className="hidden lg:flex items-center gap-5 xl:gap-7"
              role="navigation"
              aria-label="Navegación principal"
            >
              {NAV_LINKS.map(({ href, label, badge }) => (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "group relative inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-semibold tracking-wide transition-colors duration-200 py-1",
                    isScrolled
                      ? "text-pava-brown/80 hover:text-pava-green"
                      : "text-pava-cream/90 hover:text-pava-gold",
                  )}
                >
                  <span>{label}</span>
                  {badge && (
                    <span className="rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold tracking-tight">
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Search Trigger — Desktop */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={cn(
                  "hidden lg:flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 border cursor-pointer",
                  isScrolled
                    ? "bg-pava-brown/5 border-pava-brown/12 text-pava-brown/75 hover:bg-pava-brown/10 hover:text-pava-green"
                    : "bg-white/10 border-white/25 text-pava-cream hover:bg-white/20 hover:text-white backdrop-blur-sm shadow-sm",
                )}
                aria-label="Buscar productos (Ctrl+K)"
              >
                <Search size={13} className="shrink-0 opacity-85" />
                <span>Buscar</span>
                <kbd
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.5 rounded border text-inherit",
                    isScrolled
                      ? "bg-pava-brown/10 border-pava-brown/15 opacity-75"
                      : "bg-white/15 border-white/25 text-white opacity-95",
                  )}
                >
                  ⌘K
                </kbd>
              </button>

              {/* Search Trigger — Mobile */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 lg:hidden",
                  isScrolled
                    ? "text-pava-brown/75 hover:text-pava-green hover:bg-pava-brown/5"
                    : "text-pava-cream/90 hover:text-white hover:bg-white/10",
                )}
                aria-label="Buscar productos"
              >
                <Search size={18} strokeWidth={2} />
              </button>

              {/* Favorites Drawer Trigger */}
              <button
                onClick={toggleFavoritesDrawer}
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200",
                  isScrolled
                    ? "text-pava-brown/75 hover:text-pava-terracotta hover:bg-pava-brown/5"
                    : "text-pava-cream/90 hover:text-white hover:bg-white/10",
                )}
                aria-label={`Favoritos, ${favoriteIds.size} guardados`}
                title="Mis Favoritos"
              >
                <Heart
                  size={18}
                  strokeWidth={1.8}
                  className={
                    favoriteIds.size > 0
                      ? "fill-pava-terracotta text-pava-terracotta"
                      : ""
                  }
                />
                {favoriteIds.size > 0 && (
                  <span className="absolute 0 top-0.5 right-0.5 flex h-4 w-4 items-center justify-center bg-pava-terracotta text-white text-[9px] font-bold rounded-full animate-scale-in">
                    {favoriteIds.size > 9 ? "9+" : favoriteIds.size}
                  </span>
                )}
              </button>

              {/* Cart Drawer Trigger */}
              <button
                onClick={toggleDrawer}
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200",
                  isScrolled
                    ? "text-pava-brown/75 hover:text-pava-green hover:bg-pava-brown/5"
                    : "text-pava-cream/90 hover:text-white hover:bg-white/10",
                )}
                aria-label={`Carrito de compras, ${itemCount} productos`}
              >
                <ShoppingBag size={18} strokeWidth={1.8} />
                {itemCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center bg-pava-green text-white text-[9px] font-bold rounded-full">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>

              {/* Instagram link */}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "hidden xl:flex items-center justify-center h-9 w-9 rounded-full transition-colors duration-200",
                  isScrolled
                    ? "text-pava-brown/60 hover:text-pava-brown hover:bg-pava-brown/5"
                    : "text-pava-cream/70 hover:text-white hover:bg-white/10",
                )}
                aria-label="Instagram de Poné La Pava"
              >
                <InstagramIcon size={16} />
              </a>

              {/* Hamburger Button — Mobile */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 lg:hidden",
                  isScrolled
                    ? "text-pava-brown/80 hover:text-pava-green hover:bg-pava-brown/5"
                    : "text-pava-cream/90 hover:text-white hover:bg-white/10",
                )}
                aria-label={isMobileOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={isMobileOpen}
              >
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-all duration-350",
          isMobileOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none",
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />

        {/* Slide Panel */}
        <div
          className={cn(
            "absolute top-0 right-0 flex h-full w-[85vw] max-w-[22rem] flex-col bg-pava-cream shadow-2xl transition-transform duration-350",
            isMobileOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-pava-brown/8 px-6 py-5">
            <div className="flex items-center gap-2.5">
              <span className="relative block h-8 w-8 shrink-0 overflow-hidden rounded-full">
                <Image
                  src="/logo.png"
                  alt="Poné La Pava"
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </span>
              <div>
                <span className="font-display text-base font-bold text-pava-green block leading-tight">
                  Poné La Pava
                </span>
                <span className="text-[8.5px] font-semibold uppercase tracking-[0.2em] text-pava-brown-mid/60">
                  Yerbas &amp; Accesorios
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-pava-brown/60 hover:text-pava-green hover:bg-pava-brown/5 transition-colors"
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Search */}
          <div className="px-5 pt-4">
            <button
              onClick={() => {
                setIsMobileOpen(false);
                setIsSearchOpen(true);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-pava-cream-dark border border-pava-brown/10 text-pava-brown/70 text-xs font-medium hover:text-pava-green transition-all"
            >
              <span className="flex items-center gap-2">
                <Search size={15} className="text-pava-green" />
                <span>Buscar mates, yerbas, termos...</span>
              </span>
              <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 bg-pava-brown/5 rounded text-pava-brown/50">
                ⌘K
              </span>
            </button>
          </div>

          {/* Category Navigation */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-pava-brown-mid/50 px-2 block mb-2">
              Comprar por Categoría
            </span>
            {NAV_LINKS.map(({ href, label, badge }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-pava-brown hover:bg-pava-green/10 hover:text-pava-green transition-all"
              >
                <span>{label}</span>
                {badge ? (
                  <span className="rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">
                    {badge}
                  </span>
                ) : (
                  <span className="text-pava-brown/30 text-xs">→</span>
                )}
              </Link>
            ))}

            <div className="pt-4 mt-4 border-t border-pava-brown/8 space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-pava-brown-mid/50 px-2 block mb-2">
                Información &amp; Ayuda
              </span>
              {UTILITY_LINKS.map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-pava-brown-mid/80 hover:text-pava-green transition-colors"
                >
                  <span>{label}</span>
                  <span className="text-pava-brown/30 text-xs">→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-5 border-t border-pava-brown/8 flex flex-col gap-2.5 bg-pava-cream-dark/50">
            <Link
              href="/catalogo"
              onClick={() => setIsMobileOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-pava-green py-3 text-xs font-bold uppercase tracking-wider text-pava-cream shadow-sm hover:bg-pava-green-light transition-colors"
            >
              <ShoppingBag size={15} />
              <span>Ver Catálogo Completo</span>
            </Link>
            <a
              href={whatsappChatUrl(settings.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-whatsapp/30 bg-whatsapp/10 py-2.5 text-xs font-bold text-whatsapp hover:bg-whatsapp hover:text-white transition-colors"
            >
              Escribinos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
