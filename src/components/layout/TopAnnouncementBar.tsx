"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, Truck, CreditCard, MapPin } from "lucide-react";

interface Announcement {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge: string;
  text: string;
  link?: string;
}

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "cuotas-transf",
    icon: CreditCard,
    badge: "HASTA 3 CUOTAS SIN INTERÉS",
    text: "o 10% OFF EXTRA abonando con Transferencia",
    link: "/catalogo",
  },
  {
    id: "envios",
    icon: Truck,
    badge: "ENVÍOS A TODO EL PAÍS",
    text: "Despacho rápido a Río Negro, Neuquén y toda la Argentina",
    link: "/catalogo",
  },
  {
    id: "local",
    icon: MapPin,
    badge: "LOCAL EN CATRIEL",
    text: "Retiro GRATIS en San Martín 245 (Río Negro)",
    link: "/#el-local",
  },
  {
    id: "artesanal",
    icon: Sparkles,
    badge: "100% ARTESANAL",
    text: "Mates seleccionados de calabaza, alpaca y yerbas premium",
    link: "/catalogo",
  },
];

export default function TopAnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered]);

  const current = ANNOUNCEMENTS[currentIndex];
  const Icon = current.icon;

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  };

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStartX(e.touches[0].clientX);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;

    if (deltaX > 40) {
      setCurrentIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
    } else if (deltaX < -40) {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }
    setTouchStartX(null);
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative z-50 bg-[#132519] text-pava-cream border-b border-pava-gold/20 px-3 py-2 text-xs font-medium select-none shadow-sm transition-colors"
      role="region"
      aria-label="Anuncios destacados"
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-2">
        {/* Prev button */}
        <button
          onClick={handlePrev}
          className="flex items-center justify-center w-7 h-7 rounded-full text-pava-cream/70 hover:text-pava-gold hover:bg-white/10 transition-colors shrink-0"
          aria-label="Anuncio anterior"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Dynamic announcement item */}
        <div className="flex-1 flex items-center justify-center min-w-0 overflow-hidden">
          <Link
            href={current.link || "/catalogo"}
            className="group flex items-center justify-center gap-2 text-center transition-all duration-300 max-w-full hover:opacity-95"
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-pava-gold/20 text-pava-gold shrink-0 transition-transform duration-200 group-hover:scale-110">
              <Icon size={12} />
            </span>
            <div className="flex items-center gap-1.5 flex-wrap justify-center text-[11px] sm:text-xs leading-tight">
              <span className="inline-block rounded bg-pava-gold/15 border border-pava-gold/30 px-1.5 py-0.5 font-bold text-pava-gold tracking-wide uppercase text-[10px] sm:text-[11px]">
                {current.badge}
              </span>
              <span className="text-pava-cream/90 font-normal">
                {current.text}
              </span>
            </div>
          </Link>
        </div>

        {/* Next button + indicators */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="hidden md:flex items-center gap-1 mr-1">
            {ANNOUNCEMENTS.map((item, idx) => (
              <button
                key={item.id}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-4 bg-pava-gold"
                    : "w-1.5 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Ir al anuncio ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center justify-center w-7 h-7 rounded-full text-pava-cream/70 hover:text-pava-gold hover:bg-white/10 transition-colors shrink-0"
            aria-label="Siguiente anuncio"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
