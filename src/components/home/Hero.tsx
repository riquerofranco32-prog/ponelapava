"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setParallax({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    });
  };

  return (
    <section
      id="inicio"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setParallax({ x: 0, y: 0 })}
      className="grain-overlay relative flex min-h-[100svh] flex-col overflow-hidden"
      aria-label="Bienvenida a Poné La Pava"
    >
      {/* Background image — mouse-driven parallax depth layer */}
      <div
        className="absolute inset-0 z-0 transition-transform duration-300 ease-out"
        style={{
          transform: `scale(1.06) translate(${parallax.x * -10}px, ${parallax.y * -10}px)`,
        }}
      >
        <Image
          src="/hero_background_1786545961305.png"
          alt="Mate servido sobre mesa de madera"
          fill
          priority
          quality={92}
          className="object-cover object-[62%_center] sm:object-[58%_center] lg:object-center"
          sizes="100vw"
        />
        {/* Multi-layer gradient for editorial feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-pava-brown via-pava-brown/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-pava-brown/80 via-pava-brown/25 to-transparent" />
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-pava-brown/40 to-transparent" />
      </div>

      {/* Vertical brand text — editorial decoration */}
      <div
        className={`absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 lg:flex lg:flex-col lg:items-center lg:gap-4
          transition-all duration-1000 ease-out
          ${loaded ? "opacity-30 translate-x-0" : "opacity-0 translate-x-4"}`}
        aria-hidden="true"
      >
        <span
          className="block h-16 w-px bg-pava-cream/40"
          style={{ writingMode: "vertical-lr" }}
        />
        <span
          className="text-[9px] font-semibold uppercase tracking-[0.35em] text-pava-cream"
          style={{ writingMode: "vertical-rl", letterSpacing: "0.3em" }}
        >
          Argentina · Mate Culture
        </span>
        <span className="block h-16 w-px bg-pava-cream/40" />
      </div>

      {/* Main content — fills screen, content at bottom; shallower parallax depth than bg */}
      <div
        className="relative z-10 flex flex-1 flex-col justify-end transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${parallax.x * 6}px, ${parallax.y * 6}px)`,
        }}
      >
        <div className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10 lg:pb-24">
          {/* Tag line */}
          <div
            className={`mb-6 flex items-center gap-3 sm:mb-8
              transition-all duration-700 ease-out delay-100
              ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <span className="h-px w-10 bg-pava-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-pava-gold sm:text-[11px]">
              Poné La Pava · Tienda Matera
            </span>
          </div>

          {/* Headline */}
          <h1
            className={`font-display max-w-4xl leading-[0.87] tracking-[-0.04em] text-pava-cream
              text-[3.6rem] sm:text-[5.5rem] lg:text-[7.5rem] xl:text-[8.5rem]
              transition-all duration-800 ease-out delay-200
              ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            El ritual
            <br />
            <em className="not-italic text-pava-gold">del mate</em>
            <br />
            es tuyo.
          </h1>

          {/* Body + tagline row */}
          <div
            className={`mt-7 flex flex-col gap-6 sm:mt-9 sm:flex-row sm:items-end sm:gap-10 lg:mt-10
              transition-all duration-700 ease-out delay-300
              ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <p className="max-w-sm text-base leading-relaxed text-pava-cream/78 sm:text-lg lg:max-w-md">
              Yerbas seleccionadas, mates artesanales y accesorios para
              acompañar cada ronda.
            </p>
            <div className="hidden items-center gap-4 sm:flex">
              <span className="h-10 w-px bg-pava-cream/20" />
              <p className="max-w-[7rem] text-[10px] font-medium uppercase leading-relaxed tracking-[0.18em] text-pava-cream/45">
                Hecho para compartir
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div
            className={`mt-9 flex flex-col gap-3 sm:mt-11 sm:flex-row sm:gap-4
              transition-all duration-700 ease-out delay-400
              ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <Link
              href="/catalogo"
              id="hero-cta-catalogo"
              className="inline-flex items-center justify-center gap-3 bg-pava-gold px-8 py-4 text-sm font-bold tracking-wide text-pava-brown transition-all duration-200 hover:bg-pava-gold-light active:scale-[0.98] sm:px-10"
            >
              Explorar el catálogo
              <span className="text-base" aria-hidden="true">
                →
              </span>
            </Link>
            <Link
              href="/#el-local"
              id="hero-cta-local"
              className="inline-flex items-center justify-center gap-2 border border-pava-cream/35 bg-pava-brown/10 px-8 py-4 text-sm font-semibold tracking-wide text-pava-cream backdrop-blur-[3px] transition-all duration-200 hover:border-pava-cream/65 hover:bg-pava-cream/10 sm:px-10"
            >
              Conocé el local
            </Link>
          </div>

          {/* Bottom meta bar */}
          <div
            className={`mt-12 flex items-center gap-5 border-t border-pava-cream/15 pt-5 sm:mt-16
              transition-all duration-700 ease-out delay-500
              ${loaded ? "opacity-100" : "opacity-0"}`}
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-pava-cream/40">
              Argentina
            </span>
            <span className="h-1 w-1 rounded-full bg-pava-gold/60" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-pava-cream/40">
              Yerbas · Mates · Accesorios
            </span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-7 right-7 z-10 hidden flex-col items-center gap-3 lg:flex
          transition-all duration-700 ease-out delay-700
          ${loaded ? "opacity-50" : "opacity-0"}`}
        aria-hidden="true"
      >
        <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-pava-cream">
          Scroll
        </span>
        <div className="flex flex-col items-center gap-1">
          <span className="h-8 w-px bg-pava-cream/50 animate-scroll-bounce" />
        </div>
      </div>
    </section>
  );
}
