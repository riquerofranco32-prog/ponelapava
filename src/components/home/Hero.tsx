"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MagneticButton from "@/components/ui/MagneticButton";

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [allowVideo, setAllowVideo] = useState(false);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 60);
    // Skip the ~1.3MB video on small screens — mobile visitors are more
    // likely on limited data, and the poster image reads fine there.
    setAllowVideo(
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
        !window.matchMedia("(max-width: 640px)").matches,
    );
    return () => clearTimeout(timer);
  }, []);

  // Writes both layers' transforms directly to the DOM instead of through
  // useState — mousemove fires far too often to route through a re-render
  // of the whole Hero tree.
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    if (bgRef.current) {
      bgRef.current.style.transform = `scale(1.06) translate(${x * -10}px, ${y * -10}px)`;
    }
    if (contentRef.current) {
      contentRef.current.style.transform = `translate(${x * 6}px, ${y * 6}px)`;
    }
  };

  const resetParallax = () => {
    if (bgRef.current)
      bgRef.current.style.transform = "scale(1.06) translate(0px, 0px)";
    if (contentRef.current)
      contentRef.current.style.transform = "translate(0px, 0px)";
  };

  return (
    <section
      id="inicio"
      onMouseMove={handleMouseMove}
      onMouseLeave={resetParallax}
      className="grain-overlay relative flex min-h-[100svh] flex-col overflow-hidden"
      aria-label="Bienvenida a Poné La Pava"
    >
      {/* Background image — mouse-driven parallax depth layer */}
      <div
        ref={bgRef}
        className="absolute inset-0 z-0 transition-transform duration-300 ease-out"
        style={{ transform: "scale(1.06) translate(0px, 0px)" }}
      >
        {/* La imagen queda montada SIEMPRE, como capa de fondo, y el video se
            apila encima. Antes se alternaban (Image → video con `poster`), y
            eso traía el PNG dos veces: optimizado por next/image en el primer
            render, y después crudo desde /public porque los `poster` no pasan
            por el optimizador. Sin `poster`, el video se pinta transparente
            hasta su primer cuadro y lo que se ve mientras tanto es esta misma
            imagen — un solo archivo, ya optimizado. */}
        <Image
          src="/hero_background_1786545961305.png"
          alt="Mate servido sobre mesa de madera"
          fill
          priority
          quality={92}
          className="object-cover object-[62%_center] sm:object-[58%_center] lg:object-center"
          sizes="100vw"
        />
        {allowVideo && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover object-[62%_center] sm:object-[58%_center] lg:object-center"
          >
            <source src="/hero-mate-pour.mp4" type="video/mp4" />
          </video>
        )}
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
      {/* pt matches Navbar's initial height (h-20 lg:h-24) so content never renders under the fixed header on short viewports */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-1 flex-col justify-end pt-20 transition-transform duration-300 ease-out lg:pt-24"
        style={{ transform: "translate(0px, 0px)" }}
      >
        <div className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10 lg:pb-24">
          {/* Tag line — shimmer badge */}
          <div
            className={`mb-6 flex items-center gap-3 sm:mb-8
              transition-all duration-700 ease-out delay-100
              ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <span className="h-px w-10 bg-pava-gold" />
            <span className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-pava-gold/40 bg-pava-cream/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-pava-gold backdrop-blur-[2px] sm:text-[11px]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-pava-gold animate-pulse-dot" />
              Poné La Pava · Tienda Matera
              <span className="shine-sweep" aria-hidden="true" />
            </span>
          </div>

          {/* Headline — masked line reveal
              El `overflow-hidden` de cada línea es lo que hace el efecto de
              subida, pero su caja es exactamente el line-box, y con
              leading-[1.05] sobre Playfair (caja de contenido 1.33em) el
              half-leading queda negativo: debajo de la baseline sobran
              0.108em y la cola de la "y" de "tuyo" baja 0.191em, así que se
              cortaba 0.083em (11.1px en 1440, 4.8px en 390).
              Subir el leading no es la salida: para tapar el descendente
              haría falta ~1.22, y eso afloja el ritmo del titular entero.
              La salida es despegar la caja que recorta del line-box:
              padding-bottom en el hijo (que además agranda su propia altura,
              y como translate-y-full resuelve contra el border-box, el
              desplazamiento del reveal crece igual y la máscara lo sigue
              tapando por completo al arrancar) y margin-bottom negativo del
              mismo valor en el wrapper, que devuelve el ritmo vertical
              exacto: nada de lo que viene abajo se mueve. */}
          <h1
            className="font-display max-w-4xl leading-[1.05] tracking-[-0.04em] text-pava-cream
              text-[3.6rem] sm:text-[5.5rem] lg:text-[7.5rem] xl:text-[8.5rem]"
          >
            <span className="-mb-[0.14em] block overflow-hidden">
              <span
                className={`block pb-[0.14em] transition-all duration-700 ease-out delay-200
                  ${loaded ? "translate-y-0 opacity-100 blur-none" : "translate-y-full opacity-0 blur-sm"}`}
              >
                El ritual
              </span>
            </span>
            <span className="-mb-[0.14em] block overflow-hidden">
              <em
                className={`text-shine not-italic block pb-[0.14em] transition-all duration-700 ease-out delay-300
                  ${loaded ? "translate-y-0 opacity-100 blur-none" : "translate-y-full opacity-0 blur-sm"}`}
              >
                del mate
              </em>
            </span>
            <span className="-mb-[0.14em] block overflow-hidden">
              <span
                className={`block pb-[0.14em] transition-all duration-700 ease-out delay-400
                  ${loaded ? "translate-y-0 opacity-100 blur-none" : "translate-y-full opacity-0 blur-sm"}`}
              >
                es tuyo.
              </span>
            </span>
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
              <p className="max-w-[7rem] text-[10px] font-medium uppercase leading-relaxed tracking-[0.18em] text-pava-cream/75">
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
            <MagneticButton>
              <Link
                href="/catalogo"
                id="hero-cta-catalogo"
                className="inline-flex items-center justify-center gap-3 rounded-control bg-pava-gold px-8 py-4 text-sm font-bold tracking-wide text-pava-brown transition-all duration-200 hover:bg-pava-gold-light active:scale-[0.98] sm:px-10 shadow-lg shadow-pava-gold/10"
              >
                Explorar el catálogo
                <span className="text-base" aria-hidden="true">
                  →
                </span>
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                href="/#el-local"
                id="hero-cta-local"
                className="inline-flex items-center justify-center gap-2 rounded-control border border-pava-cream/35 bg-pava-brown/10 px-8 py-4 text-sm font-semibold tracking-wide text-pava-cream backdrop-blur-[3px] transition-all duration-200 hover:border-pava-cream/65 hover:bg-pava-cream/10 sm:px-10"
              >
                Conocé el local
              </Link>
            </MagneticButton>
          </div>

          {/* Floating Trust Badges */}
          <div
            className={`mt-8 flex flex-wrap items-center gap-2.5 sm:gap-3.5
              transition-all duration-700 ease-out delay-450
              ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-pava-gold/30 bg-pava-green-dark/60 px-4 py-1.5 backdrop-blur-md text-xs text-pava-cream shadow-lg shadow-black/20 transition-transform duration-300 hover:scale-105 hover:border-pava-gold/60">
              <span className="flex text-pava-gold text-xs tracking-tight" aria-hidden="true">★★★★★</span>
              <span className="font-bold text-pava-cream">5.0</span>
              <span className="text-pava-cream/70 text-[11px]">en Google</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-pava-cream/20 bg-pava-green-dark/60 px-4 py-1.5 backdrop-blur-md text-xs text-pava-cream shadow-lg shadow-black/20 transition-transform duration-300 hover:scale-105 hover:border-pava-gold/40">
              <span className="text-pava-gold text-xs">🚚</span>
              <span className="font-medium text-pava-cream/95">Envíos a todo el país</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-pava-cream/20 bg-pava-green-dark/60 px-4 py-1.5 backdrop-blur-md text-xs text-pava-cream shadow-lg shadow-black/20 transition-transform duration-300 hover:scale-105 hover:border-pava-gold/40">
              <span className="text-pava-gold text-xs">🧉</span>
              <span className="font-medium text-pava-cream/95">+1.000 clientes felices</span>
            </div>
          </div>

          {/* Bottom meta bar */}
          <div
            className={`mt-10 flex items-center gap-5 border-t border-pava-cream/15 pt-5 sm:mt-12
              transition-all duration-700 ease-out delay-500
              ${loaded ? "opacity-100" : "opacity-0"}`}
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-pava-cream/75">
              Argentina
            </span>
            <span className="h-1 w-1 rounded-full bg-pava-gold/60" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-pava-cream/75">
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
