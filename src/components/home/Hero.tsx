"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MagneticButton from "@/components/ui/MagneticButton";
import { LandingHero } from "@/types/landing";
import { DEFAULT_LANDING_CONTENT } from "@/lib/landing";

export default function Hero({ content }: { content?: LandingHero }) {
  const hero = content || DEFAULT_LANDING_CONTENT.hero;
  const [loaded, setLoaded] = useState(false);
  const [allowVideo, setAllowVideo] = useState(false);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 60);
    // Skip video on reduced-motion preference
    setAllowVideo(
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
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
        {/* Ambient color orbs for depth & warmth */}
        <span className="hero-orb hero-orb-1" aria-hidden="true" />
        <span className="hero-orb hero-orb-2" aria-hidden="true" />
        <span className="hero-orb hero-orb-3" aria-hidden="true" />

        {/* La imagen queda montada SIEMPRE como fallback debajo del video */}
        <Image
          src={hero.backgroundImage || "/hero_background_1786545961305.png"}
          alt="Foto de portada Poné La Pava"
          fill
          priority
          quality={92}
          className="object-cover object-center"
          sizes="100vw"
        />
        {allowVideo && hero.videoUrl && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover object-center"
          >
            <source src={hero.videoUrl} type="video/mp4" />
          </video>
        )}
        {/* Multi-layer gradient for editorial feel and crystal clear navbar readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-pava-brown via-pava-brown/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-pava-brown/85 via-pava-brown/30 to-transparent" />
        <div className="absolute top-0 inset-x-0 h-52 bg-gradient-to-b from-pava-brown/85 via-pava-brown/40 to-transparent" />
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

      {/* Main content — fills screen, with safe top clearance under fixed announcement + navbar */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-1 flex-col justify-end pt-36 sm:pt-40 lg:pt-44 pb-14 sm:pb-16 lg:pb-20 transition-transform duration-300 ease-out"
        style={{ transform: "translate(0px, 0px)" }}
      >
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
          {/* Tag line — shimmer badge */}
          <div
            className={`mb-5 flex items-center gap-3 sm:mb-7
              transition-all duration-700 ease-out delay-100
              ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <span className="h-px w-10 bg-pava-gold" />
            <span className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-pava-gold/40 bg-pava-cream/5 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-pava-gold backdrop-blur-[2px] sm:text-[11px]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-pava-gold animate-pulse-dot" />
              {hero.badge || "Poné La Pava · Tienda Matera"}
              <span className="shine-sweep" aria-hidden="true" />
            </span>
          </div>

          <h1
            className="font-display max-w-4xl leading-[1.05] tracking-[-0.04em] text-pava-cream
              text-[3.6rem] sm:text-[5.5rem] lg:text-[7.5rem] xl:text-[8.5rem]"
          >
            <span className="-mb-[0.14em] block overflow-hidden">
              <span
                className={`block pb-[0.14em] transition-all duration-700 ease-out delay-200
                  ${loaded ? "translate-y-0 opacity-100 blur-none" : "translate-y-full opacity-0 blur-sm"}`}
              >
                {hero.titleLine1 || "El ritual"}
              </span>
            </span>
            <span className="-mb-[0.14em] block overflow-hidden">
              <em
                className={`text-shine not-italic block pb-[0.14em] transition-all duration-700 ease-out delay-300
                  ${loaded ? "translate-y-0 opacity-100 blur-none" : "translate-y-full opacity-0 blur-sm"}`}
              >
                {hero.titleLine2 || "del mate"}
              </em>
            </span>
            <span className="-mb-[0.14em] block overflow-hidden">
              <span
                className={`block pb-[0.14em] transition-all duration-700 ease-out delay-400
                  ${loaded ? "translate-y-0 opacity-100 blur-none" : "translate-y-full opacity-0 blur-sm"}`}
              >
                {hero.titleLine3 || "es tuyo."}
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
              {hero.subtitle || "Yerbas seleccionadas, mates artesanales y accesorios para acompañar cada ronda."}
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
                href={hero.ctaPrimaryLink || "/catalogo"}
                id="hero-cta-catalogo"
                className="cta-pulse-ring inline-flex items-center justify-center gap-3 rounded-control bg-pava-gold px-8 py-4 text-sm font-bold tracking-wide text-pava-brown transition-all duration-200 hover:bg-pava-gold-light active:scale-[0.98] sm:px-10 shadow-lg shadow-pava-gold/10"
              >
                {hero.ctaPrimaryText || "Explorar el catálogo"}
                <span className="text-base" aria-hidden="true">
                  →
                </span>
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                href={hero.ctaSecondaryLink || "/#el-local"}
                id="hero-cta-local"
                className="inline-flex items-center justify-center gap-2 rounded-control border border-pava-cream/35 bg-pava-brown/10 px-8 py-4 text-sm font-semibold tracking-wide text-pava-cream backdrop-blur-[3px] transition-all duration-200 hover:border-pava-cream/65 hover:bg-pava-cream/10 sm:px-10"
              >
                {hero.ctaSecondaryText || "Conocé el local"}
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
