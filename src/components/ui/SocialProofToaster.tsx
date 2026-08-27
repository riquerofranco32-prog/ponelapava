"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle, X, Sparkles } from "lucide-react";

interface SocialProofEvent {
  id: string;
  name: string;
  location: string;
  productName: string;
  productSlug: string;
  productImage: string;
  timeAgo: string;
}

const EVENTS: SocialProofEvent[] = [
  {
    id: "sp-1",
    name: "Agustín M.",
    location: "General Roca, Río Negro",
    productName: "Mate Imperial Torpedo Cuero",
    productSlug: "mate-imperial-torpedo-cuero",
    productImage: "/product_mate_calabaza_1786546121145.png",
    timeAgo: "Hace 6 minutos",
  },
  {
    id: "sp-2",
    name: "Valeria S.",
    location: "Cipolletti, Río Negro",
    productName: "Combo Matero Completo Patagónico",
    productSlug: "combo-matero-completo-patagonico",
    productImage: "/product_combo_kit_1786546132809.png",
    timeAgo: "Hace 14 minutos",
  },
  {
    id: "sp-3",
    name: "Martín R.",
    location: "Neuquén Capital",
    productName: "Yerba Mate Sara Suave 1kg",
    productSlug: "yerba-mate-sara-suave-1kg",
    productImage: "/product_yerba_amanda_1786546104213.png",
    timeAgo: "Hace 22 minutos",
  },
  {
    id: "sp-4",
    name: "Camila B.",
    location: "Catriel, Río Negro",
    productName: "Bombilla Pico de Loro Alpaca",
    productSlug: "bombilla-pico-de-loro-alpaca",
    productImage: "/category_bombillas_1786546023442.png",
    timeAgo: "Hace 35 minutos",
  },
  {
    id: "sp-5",
    name: "Gonzalo T.",
    location: "Bariloche, Río Negro",
    productName: "Termo Stanley Classic 1.4L",
    productSlug: "termo-stanley-classic-14l",
    productImage: "/category_termos_1786546003986.png",
    timeAgo: "Hace 48 minutos",
  },
];

export default function SocialProofToaster() {
  const pathname = usePathname();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Hide in admin and checkout pages
  const isHiddenRoute = pathname.startsWith("/admin") || pathname === "/carrito" || pathname === "/login";

  useEffect(() => {
    if (isHiddenRoute || isDismissed) return;

    // Initial delay before first popup
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 4500);

    return () => clearTimeout(initialTimer);
  }, [isHiddenRoute, isDismissed]);

  useEffect(() => {
    if (isHiddenRoute || isDismissed || !isVisible || isPaused) return;

    // Visible duration: 6 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);

      // Wait 10 seconds before showing next
      const nextTimer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % EVENTS.length);
        setIsVisible(true);
      }, 10000);

      return () => clearTimeout(nextTimer);
    }, 6000);

    return () => clearTimeout(hideTimer);
  }, [isVisible, isPaused, isHiddenRoute, isDismissed, currentIndex]);

  if (isHiddenRoute || isDismissed) return null;

  const current = EVENTS[currentIndex];

  return (
    <aside
      aria-label="Actividad de compras en vivo"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed bottom-5 left-5 z-40 max-w-[340px] w-[calc(100vw-2.5rem)] transition-all duration-500 ease-out sm:w-auto ${
        isVisible
          ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
          : "translate-y-6 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="relative flex items-center gap-3.5 rounded-2xl border border-pava-brown/15 bg-white/95 p-3.5 shadow-[0_12px_36px_-10px_rgba(42,32,24,0.22)] backdrop-blur-md transition-all hover:border-pava-green/30 hover:shadow-[0_16px_40px_-10px_rgba(42,32,24,0.28)]">
        {/* Product image thumbnail */}
        <Link
          href={`/producto/${current.productSlug}`}
          className="relative h-13 w-13 shrink-0 overflow-hidden rounded-xl border border-pava-brown/10 bg-pava-cream/60"
        >
          <Image
            src={current.productImage}
            alt={current.productName}
            fill
            sizes="52px"
            className="object-cover transition-transform duration-300 hover:scale-110"
          />
          <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-tl-md bg-pava-green text-white">
            <CheckCircle size={10} strokeWidth={2.5} />
          </span>
        </Link>

        {/* Content */}
        <div className="min-w-0 flex-1 pr-4">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-pava-brown-mid/80">
            <span className="font-semibold text-pava-green">{current.name}</span>
            <span>de {current.location}</span>
          </div>

          <Link
            href={`/producto/${current.productSlug}`}
            className="mt-0.5 line-clamp-1 block text-xs font-bold text-pava-brown hover:text-pava-green transition-colors"
          >
            {current.productName}
          </Link>

          <div className="mt-1 flex items-center gap-2 text-[10px] text-pava-brown-mid/60">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <Sparkles size={10} /> Compra verificada
            </span>
            <span>•</span>
            <span>{current.timeAgo}</span>
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setIsDismissed(true);
          }}
          className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-pava-brown/40 transition-colors hover:bg-pava-brown/10 hover:text-pava-brown"
          aria-label="Cerrar notificación"
        >
          <X size={12} />
        </button>
      </div>
    </aside>
  );
}
