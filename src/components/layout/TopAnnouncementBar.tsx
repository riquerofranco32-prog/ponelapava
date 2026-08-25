"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Truck, CreditCard, MapPin } from "lucide-react";

interface Announcement {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  highlight: string;
  text: string;
}

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "transf",
    icon: CreditCard,
    highlight: "10% OFF EXTRA",
    text: "abonando con Transferencia Bancaria",
  },
  {
    id: "local",
    icon: MapPin,
    highlight: "Retiro GRATIS",
    text: "en nuestro local de Catriel (San Martín 245)",
  },
  {
    id: "envios",
    icon: Truck,
    highlight: "Envíos Seguros",
    text: "a Río Negro, Neuquén y todo el país",
  },
  {
    id: "custom",
    icon: Sparkles,
    highlight: "Personalizados",
    text: "Grabados láser en mates de calabaza e imperial",
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
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const current = ANNOUNCEMENTS[currentIndex];
  const Icon = current.icon;

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStartX(e.touches[0].clientX);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;

    if (deltaX > 40) {
      // Swipe right -> prev
      setCurrentIndex(
        (prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length,
      );
    } else if (deltaX < -40) {
      // Swipe left -> next
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
      className="relative z-50 bg-[#1b3123] text-pava-cream border-b border-white/10 px-3 py-1.5 sm:py-2 text-xs font-medium select-none cursor-grab active:cursor-grabbing"
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between">
        {/* Prev button */}
        <button
          onClick={() =>
            setCurrentIndex(
              (prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length,
            )
          }
          className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full text-pava-cream/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Anuncio anterior"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Dynamic announcement item */}
        <div className="flex-1 flex items-center justify-center gap-2 text-center transition-all duration-300">
          <span className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-pava-gold/20 text-pava-gold shrink-0">
            <Icon size={11} />
          </span>
          <span className="inline-flex items-center gap-1.5 flex-wrap justify-center text-[11px] sm:text-[13px] leading-tight">
            <strong className="font-bold text-pava-gold tracking-wide uppercase text-[10px] sm:text-xs">
              {current.highlight}
            </strong>
            <span className="text-white/90 font-sans">{current.text}</span>
          </span>
        </div>

        {/* Next button */}
        <button
          onClick={() =>
            setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length)
          }
          className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full text-pava-cream/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Siguiente anuncio"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
