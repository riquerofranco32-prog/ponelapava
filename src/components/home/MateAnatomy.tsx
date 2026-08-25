"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Check, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { BorderBeam } from "@/components/ui/BorderBeam";

interface Hotspot {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  top: string;
  left: string;
  tag: string;
}

const HOTSPOTS: Hotspot[] = [
  {
    id: "virola",
    title: "Virola de Alpaca Cincelada",
    subtitle: "Terminación artesanal de autor",
    desc: "Cincelada a mano con guardas tradicionales. Brillo inalterable y ajuste hermético que protege la boca del mate.",
    top: "22%",
    left: "58%",
    tag: "Orfebrería Criolla",
  },
  {
    id: "bombilla",
    title: "Bombilla Pico de Loro",
    subtitle: "Acero quirúrgico & Alpaca",
    desc: "Curvatura ergonómica que facilita cada cebada. Filtro ranurado de alta precisión que nunca se tapa, incluso con moliendas finas.",
    top: "14%",
    left: "32%",
    tag: "Flujo Perfecto",
  },
  {
    id: "calabaza",
    title: "Calabaza Seleccionada",
    subtitle: "Paredes de alto espesor",
    desc: "Fruto de origen brasilero curado por expertos. No transmite el calor a la mano y realza las notas aromáticas de la yerba.",
    top: "54%",
    left: "64%",
    tag: "Sabor Puro",
  },
  {
    id: "cuero",
    title: "Cuero Vaqueta Cosido a Mano",
    subtitle: "Base estable de 4 apoyos",
    desc: "Teñido y curtido vegetal artesanal con costuras reforzadas. Estabilidad absoluta en cualquier superficie.",
    top: "78%",
    left: "48%",
    tag: "Durabilidad",
  },
];

export default function MateAnatomy() {
  const [activeId, setActiveId] = useState<string>("virola");
  const activeSpot = HOTSPOTS.find((s) => s.id === activeId) ?? HOTSPOTS[0];

  return (
    <section className="relative overflow-hidden bg-pava-green py-24 sm:py-28 lg:py-36 text-pava-cream">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <ScrollReveal direction="up" className="mb-14 max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-9 bg-pava-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-gold">
              Anatomía del Mate Perfecto
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold leading-[0.93] tracking-tight text-pava-cream sm:text-5xl lg:text-6xl">
            Cada detalle cuenta,
            <br />
            <em className="not-italic text-pava-gold">cada pieza tiene alma.</em>
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-pava-cream/75 max-w-lg">
            Tocá los puntos interactivos para descubrir qué hace únicos a nuestros mates de autor.
          </p>
        </ScrollReveal>

        {/* Interactive Layout */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Interactive Image with Hotspots */}
          <ScrollReveal
            direction="left"
            className="relative lg:col-span-7 flex items-center justify-center rounded-card border border-pava-cream/15 bg-pava-green-dark/70 p-6 sm:p-10 shadow-2xl backdrop-blur-md overflow-hidden min-h-[420px] sm:min-h-[500px]"
          >
            <div className="relative aspect-square w-full max-w-[380px] sm:max-w-[440px]">
              <Image
                src="/product_mate_calabaza_1786546121145.png"
                alt="Mate artesanal de calabaza y virola cincelada"
                fill
                className="object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)] transition-transform duration-500"
              />

              {/* Hotspot Pins */}
              {HOTSPOTS.map((spot) => {
                const isActive = spot.id === activeId;
                return (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => setActiveId(spot.id)}
                    onMouseEnter={() => setActiveId(spot.id)}
                    aria-label={`Ver detalles de ${spot.title}`}
                    style={{ top: spot.top, left: spot.left }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer focus:outline-none"
                  >
                    <span className="relative flex h-8 w-8 items-center justify-center">
                      <span
                        className={`absolute inline-flex h-full w-full rounded-full bg-pava-gold opacity-75 animate-ping ${
                          isActive ? "opacity-100" : "group-hover:opacity-100"
                        }`}
                      />
                      <span
                        className={`relative inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-transform duration-200 ${
                          isActive
                            ? "bg-pava-gold text-pava-brown scale-110 shadow-lg shadow-pava-gold/50"
                            : "bg-pava-brown text-pava-gold border border-pava-gold group-hover:scale-105"
                        }`}
                      >
                        +
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Corner ambient glow */}
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-pava-gold/10 blur-3xl" />
          </ScrollReveal>

          {/* Feature Detail Card */}
          <ScrollReveal direction="right" className="lg:col-span-5">
            <div className="relative rounded-card border border-pava-cream/20 bg-pava-green-dark/80 p-8 shadow-2xl backdrop-blur-md overflow-hidden">
              <BorderBeam
                size={220}
                duration={10}
                borderWidth={1.5}
                colorFrom="#c7a67a"
                colorTo="transparent"
              />

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pava-gold/40 bg-pava-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-pava-gold">
                <Sparkles size={12} />
                {activeSpot.tag}
              </div>

              <h3 className="font-display text-2xl font-bold text-pava-cream sm:text-3xl">
                {activeSpot.title}
              </h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-pava-gold/80">
                {activeSpot.subtitle}
              </p>

              <p className="mt-5 text-sm leading-relaxed text-pava-cream/80">
                {activeSpot.desc}
              </p>

              {/* Selector Pills */}
              <div className="mt-8 grid grid-cols-2 gap-2 pt-6 border-t border-pava-cream/10">
                {HOTSPOTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveId(s.id)}
                    className={`flex items-center gap-2 rounded-control px-3 py-2 text-left text-xs font-semibold transition-all duration-200 ${
                      s.id === activeId
                        ? "bg-pava-gold text-pava-brown shadow-sm"
                        : "bg-pava-cream/5 text-pava-cream/70 hover:bg-pava-cream/10 hover:text-pava-cream"
                    }`}
                  >
                    <Check size={13} className={s.id === activeId ? "opacity-100" : "opacity-0"} />
                    <span className="truncate">{s.title.split(" ")[0]} {s.title.split(" ")[1] ?? ""}</span>
                  </button>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-8">
                <Link
                  href="/catalogo?cat=mates"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-control bg-pava-gold px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-pava-brown shadow-lg shadow-pava-gold/15 transition-all hover:bg-pava-gold-light active:scale-[0.98]"
                >
                  Ver Mates Artesanales <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
