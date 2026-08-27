"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Link from "next/link";

interface MateMoment {
  id: string;
  emoji: string;
  time: string;
  title: string;
  description: string;
  tags: string[];
  gradientFrom: string;
  gradientTo: string;
  textClass: string;
  accentClass: string;
}

const MOMENTS: MateMoment[] = [
  {
    id: "amanecer",
    emoji: "🌅",
    time: "6:00 AM",
    title: "El primer mate del día",
    description:
      "Antes que nada. El agua aún no hirvió y la casa todavía duerme. Es tuyo.",
    tags: ["Silencio", "Arranque", "Solo"],
    gradientFrom: "#FEF3C7",
    gradientTo: "#FDE68A",
    textClass: "text-amber-900",
    accentClass: "bg-amber-200/60 text-amber-800",
  },
  {
    id: "trabajo",
    emoji: "💼",
    time: "10:00 AM",
    title: "La ronda de la oficina",
    description:
      "El termo en la mesa, el mate que rota. La reunión más honesta del día.",
    tags: ["Oficina", "Ronda", "Equipo"],
    gradientFrom: "#D1FAE5",
    gradientTo: "#A7F3D0",
    textClass: "text-emerald-900",
    accentClass: "bg-emerald-200/60 text-emerald-800",
  },
  {
    id: "siesta",
    emoji: "☀️",
    time: "2:00 PM",
    title: "Mate al sol de verano",
    description:
      "Tereré en la mano, sombra bajo el árbol. El tiempo se para un momento.",
    tags: ["Verano", "Tereré", "Al aire libre"],
    gradientFrom: "#FEE2E2",
    gradientTo: "#FECACA",
    textClass: "text-red-900",
    accentClass: "bg-red-200/60 text-red-800",
  },
  {
    id: "tarde",
    emoji: "🍂",
    time: "5:00 PM",
    title: "La tarde matera",
    description:
      "El pico del consumo. Entre charla y charla, la yerba empieza a lavarse.",
    tags: ["Sobremesa", "Conversación", "Pausa"],
    gradientFrom: "#FEF9C3",
    gradientTo: "#FDE68A",
    textClass: "text-yellow-900",
    accentClass: "bg-yellow-200/60 text-yellow-900",
  },
  {
    id: "familia",
    emoji: "👨‍👩‍👧",
    time: "7:00 PM",
    title: "La ronda familiar",
    description:
      "El mate va y viene entre generaciones. Nadie habla de nada y de todo.",
    tags: ["Familia", "Tradición", "Hogar"],
    gradientFrom: "#E0E7FF",
    gradientTo: "#C7D2FE",
    textClass: "text-indigo-900",
    accentClass: "bg-indigo-200/60 text-indigo-800",
  },
  {
    id: "noche",
    emoji: "🌙",
    time: "11:00 PM",
    title: "El último mate",
    description:
      "Cuando la yerba ya dio todo y el termo enfría. Igual lo cebarías de nuevo.",
    tags: ["Noche", "Ritual", "Cierre"],
    gradientFrom: "#1E1B4B",
    gradientTo: "#312E81",
    textClass: "text-indigo-100",
    accentClass: "bg-indigo-800/60 text-indigo-200",
  },
];

export default function MateMoments() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener("scroll", updateScrollState);
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
  };

  return (
    <section
      id="momentos-mate"
      className="relative overflow-hidden bg-pava-cream-dark/30 py-20 sm:py-24 lg:py-28 border-b border-pava-brown/10"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header row */}
        <ScrollReveal direction="up" className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="mb-3.5 flex items-center gap-3">
              <span className="h-px w-8 bg-pava-gold-deep" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-gold-deep">
                Cultura matera
              </span>
            </div>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-pava-brown sm:text-4xl lg:text-5xl">
              Un mate para
              <br />
              <em className="not-italic text-pava-green">cada momento.</em>
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Anterior"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-pava-brown/20 bg-white text-pava-brown shadow-sm transition-all hover:border-pava-green hover:text-pava-green disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Siguiente"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-pava-brown/20 bg-white text-pava-brown shadow-sm transition-all hover:border-pava-green hover:text-pava-green disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </ScrollReveal>

        {/* Horizontal scroll track */}
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory -mx-5 px-5 sm:mx-0 sm:px-0"
        >
          {MOMENTS.map((m) => (
            <div
              key={m.id}
              className="snap-start shrink-0 w-[280px] sm:w-[300px] rounded-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-default"
              style={{
                background: `linear-gradient(135deg, ${m.gradientFrom}, ${m.gradientTo})`,
              }}
            >
              {/* Card body */}
              <div className="p-5 flex flex-col h-full min-h-[260px]">
                {/* Time label */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-[0.2em] ${m.textClass} opacity-60`}
                  >
                    {m.time}
                  </span>
                  <span className="text-3xl">{m.emoji}</span>
                </div>

                {/* Title */}
                <h3 className={`font-display text-xl font-bold leading-tight ${m.textClass} mb-2`}>
                  {m.title}
                </h3>

                {/* Description */}
                <p className={`text-sm leading-relaxed ${m.textClass} opacity-75 flex-1`}>
                  {m.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {m.tags.map((t) => (
                    <span
                      key={t}
                      className={`rounded-chip px-2 py-0.5 text-[10px] font-bold border border-transparent ${m.accentClass}`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Final CTA card */}
          <div className="snap-start shrink-0 w-[280px] sm:w-[300px] rounded-card overflow-hidden bg-pava-brown flex flex-col items-center justify-center min-h-[260px] p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <span className="text-4xl mb-4">🛒</span>
            <h3 className="font-display text-xl font-bold text-pava-cream mb-2">
              Armá tu kit matero
            </h3>
            <p className="text-sm text-pava-cream/70 mb-5 leading-relaxed">
              Mates, yerbas, termos y accesorios para todos los momentos.
            </p>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 rounded-control bg-pava-gold px-5 py-2.5 text-sm font-bold text-pava-brown hover:bg-pava-gold-light transition-colors"
            >
              Ver catálogo →
            </Link>
          </div>
        </div>

        {/* Scroll progress dots */}
        <div className="mt-5 flex items-center justify-center gap-1.5" aria-hidden="true">
          {MOMENTS.map((m) => (
            <span
              key={m.id}
              className="h-1.5 w-1.5 rounded-full bg-pava-brown/20"
            />
          ))}
          <span className="h-1.5 w-1.5 rounded-full bg-pava-brown/20" />
        </div>
      </div>
    </section>
  );
}
