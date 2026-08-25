"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, Search } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { InstagramIcon } from "@/components/ui/icons";
import { NAV_LINKS } from "@/lib/nav";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/lib/site";
import { whatsappChatUrl } from "@/lib/whatsapp";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import TopAnnouncementBar from "@/components/layout/TopAnnouncementBar";
import StoreSearchModal from "@/components/layout/StoreSearchModal";

const mainLinks = NAV_LINKS.filter((link) => link.href !== "/catalogo");

export default function Navbar() {
  const pathname = usePathname();
  const settings = useSiteSettings();
  // Only the homepage has a full-bleed hero the transparent navbar can sit
  // over. Every other page renders its own content at the top, so the
  // navbar must stay solid there or it collides with that content.
  const hasHero = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const isScrolled = hasHero ? scrolled : true;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { itemCount, toggleDrawer } = useCart();

  useEffect(() => {
    if (!hasHero) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 48);
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
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "border-b border-pava-brown/8 bg-pava-cream/97 backdrop-blur-lg lg:border-0 lg:bg-transparent lg:px-4 lg:pt-2 lg:backdrop-blur-none"
            : "bg-transparent",
        )}
      >
        <TopAnnouncementBar />
        <div
          className={cn(
            "mx-auto max-w-7xl px-5 transition-all duration-500 sm:px-8 lg:px-10",
            isScrolled &&
              "lg:max-w-6xl lg:rounded-full lg:border lg:border-pava-brown/10 lg:bg-pava-cream/97 lg:px-6 lg:shadow-[0_12px_32px_-14px_rgba(38,64,46,0.35)] lg:backdrop-blur-lg lg:mt-2",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between transition-all duration-400",
              isScrolled ? "h-[4.25rem]" : "h-20 lg:h-24",
            )}
          >
            {/* Logo */}
            <Link
              href="/"
              className="group flex items-center gap-2.5"
              aria-label="Poné La Pava — Inicio"
            >
              <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-full lg:h-10 lg:w-10">
                <Image
                  src="/logo.png"
                  alt=""
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
                      ? "text-xl text-pava-green lg:text-[1.4rem]"
                      : "text-2xl text-pava-cream lg:text-[1.65rem]",
                  )}
                >
                  Poné La Pava
                </span>
                <span
                  className={cn(
                    "mt-0.5 text-[9px] font-semibold uppercase tracking-[0.26em] transition-colors duration-300",
                    isScrolled
                      ? "text-pava-brown-mid/60"
                      : "text-pava-cream/55",
                  )}
                >
                  Yerbas &amp; Accesorios
                </span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav
              className="hidden lg:flex items-center gap-7"
              role="navigation"
              aria-label="Navegación principal"
            >
              {mainLinks.map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "nav-link text-[13px] font-medium tracking-wide transition-colors duration-200",
                    isScrolled
                      ? "text-pava-brown/75 hover:text-pava-green"
                      : "text-pava-cream/80 hover:text-pava-cream",
                  )}
                >
                  {label}
                </Link>
              ))}

              {/* Catálogo — highlighted */}
              <Link
                href="/catalogo"
                className={cn(
                  "nav-link text-[13px] font-semibold tracking-wide transition-colors duration-200",
                  isScrolled
                    ? "text-pava-green hover:text-pava-green-light"
                    : "text-pava-gold hover:text-pava-gold-light",
                )}
              >
                Catálogo
              </Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search trigger — desktop */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={cn(
                  "hidden lg:flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 border",
                  isScrolled
                    ? "bg-pava-brown/5 border-pava-brown/10 text-pava-brown/70 hover:bg-pava-brown/10 hover:text-pava-green"
                    : "bg-pava-cream/10 border-pava-cream/20 text-pava-cream/80 hover:bg-pava-cream/20 hover:text-pava-cream",
                )}
                aria-label="Buscar productos (Ctrl+K)"
              >
                <Search size={14} />
                <span>Buscar</span>
                <kbd className="text-[10px] font-mono px-1 py-0.5 rounded bg-pava-brown/10 text-inherit opacity-75">⌘K</kbd>
              </button>

              {/* Search trigger — mobile */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center transition-colors duration-200 lg:hidden",
                  isScrolled
                    ? "text-pava-brown/70 hover:text-pava-green"
                    : "text-pava-cream/80 hover:text-pava-cream",
                )}
                aria-label="Buscar productos"
              >
                <Search size={20} strokeWidth={1.75} />
              </button>

              {/* Instagram — desktop only */}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "hidden lg:flex items-center justify-center h-10 w-10 transition-colors duration-200",
                  isScrolled
                    ? "text-pava-brown/50 hover:text-pava-brown"
                    : "text-pava-cream/50 hover:text-pava-cream",
                )}
                aria-label="Instagram de Poné La Pava"
              >
                <InstagramIcon />
              </a>

              {/* Cart */}
              <button
                onClick={toggleDrawer}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center transition-colors duration-200",
                  isScrolled
                    ? "text-pava-brown/70 hover:text-pava-green"
                    : "text-pava-cream/80 hover:text-pava-cream",
                )}
                aria-label={`Carrito, ${itemCount} productos`}
              >
                <ShoppingBag size={20} strokeWidth={1.75} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center bg-pava-terracotta text-white text-[9px] font-bold rounded-full">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>

              {/* Ver catálogo CTA — desktop */}
              <Link
                href="/catalogo"
                id="navbar-cta"
                className={cn(
                  "hidden lg:flex items-center gap-2 rounded-control px-5 py-2.5 text-[13px] font-semibold tracking-wide transition-all duration-200",
                  isScrolled
                    ? "bg-pava-green text-pava-cream hover:bg-pava-green-light"
                    : "bg-pava-cream/10 border border-pava-cream/30 text-pava-cream hover:bg-pava-cream/18 hover:border-pava-cream/50 backdrop-blur-sm",
                )}
              >
                Ver catálogo
              </Link>

              {/* Hamburger — mobile */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center transition-colors duration-200 lg:hidden",
                  isScrolled
                    ? "text-pava-brown/70 hover:text-pava-green"
                    : "text-pava-cream/80 hover:text-pava-cream",
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
          "fixed inset-0 z-40 lg:hidden transition-all duration-350",
          isMobileOpen ? "opacity-100 visible" : "opacity-0 invisible",
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-pava-brown/65 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />

        {/* Slide panel */}
        <div
          className={cn(
            "absolute top-0 right-0 flex h-full w-[85vw] max-w-[22rem] flex-col bg-pava-cream shadow-2xl transition-transform duration-350",
            isMobileOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-pava-brown/8 px-6 py-5">
            <div className="flex items-center gap-2.5">
              <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-full">
                <Image
                  src="/logo.png"
                  alt=""
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </span>
              <div>
                <span className="font-display text-lg font-bold text-pava-green">
                  Poné La Pava
                </span>
                <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.22em] text-pava-brown-mid/50">
                  Yerbas &amp; Accesorios
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="flex h-9 w-9 items-center justify-center text-pava-brown/60 hover:text-pava-green transition-colors"
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick search button */}
          <div className="px-6 pt-4">
            <button
              onClick={() => {
                setIsMobileOpen(false);
                setIsSearchOpen(true);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-pava-cream-dark border border-pava-brown/10 text-pava-brown/60 text-sm font-medium hover:text-pava-green hover:border-pava-green/30 transition-all"
            >
              <span className="flex items-center gap-2">
                <Search size={16} className="text-pava-green" />
                <span>Buscar productos...</span>
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 bg-pava-brown/5 rounded text-pava-brown/40">
                Buscar
              </span>
            </button>
          </div>

          {/* Nav links */}
          <nav
            className="flex-1 flex flex-col px-6 pt-2 gap-0"
            role="navigation"
            aria-label="Menú mobile"
          >
            {mainLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setIsMobileOpen(false)}
                className="border-b border-pava-brown/8 py-4 text-base font-medium text-pava-brown/80 hover:text-pava-green transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/catalogo"
              onClick={() => setIsMobileOpen(false)}
              className="border-b border-pava-brown/8 py-4 text-base font-semibold text-pava-green hover:text-pava-green-light transition-colors duration-150"
            >
              Catálogo
            </Link>
          </nav>

          {/* CTA panel bottom */}
          <div className="px-6 pb-8 pt-4 flex flex-col gap-3">
            <Link
              href="/catalogo"
              onClick={() => setIsMobileOpen(false)}
              className="flex w-full items-center justify-center rounded-control bg-pava-green py-4 text-sm font-semibold tracking-wide text-pava-cream transition-colors duration-200 hover:bg-pava-green-light"
            >
              Ver catálogo
            </Link>
            <a
              href={whatsappChatUrl(settings.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-control bg-whatsapp py-4 text-sm font-semibold tracking-wide text-white transition-colors duration-200 hover:bg-whatsapp-dark"
            >
              Escribinos por WhatsApp
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-control border border-pava-brown/15 py-3.5 text-sm font-medium text-pava-brown/70 transition-colors duration-200 hover:text-pava-green"
            >
              <InstagramIcon size={15} />@{INSTAGRAM_HANDLE}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
