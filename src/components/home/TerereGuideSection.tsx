"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Flame,
  Sun,
  Sparkles,
  ArrowRight,
  Droplets,
  Thermometer,
} from "lucide-react";

export default function TerereGuideSection() {
  const [mode, setMode] = useState<"hot" | "cold">("cold");

  return (
    <section className="py-16 lg:py-24 bg-pava-cream-dark/50 border-t border-b border-pava-brown/10 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-pava-brown/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-pava-brown mb-3 shadow-2xs">
            <Sparkles size={13} className="text-pava-gold" />
            <span>Guía de Temporada</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-pava-brown tracking-tight">
            El Arte del Mate & Tereré
          </h2>
          <p className="mt-3 text-sm sm:text-base text-pava-brown-mid/80 leading-relaxed">
            Descubrí la fórmula perfecta para cada momento del día según la temperatura y tu energía.
          </p>

          {/* Mode Switcher Buttons */}
          <div className="inline-flex p-1.5 rounded-2xl bg-white border border-pava-brown/15 shadow-sm mt-6">
            <button
              onClick={() => setMode("cold")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === "cold"
                  ? "bg-cyan-600 text-white shadow-md"
                  : "text-pava-brown/70 hover:text-pava-brown"
              }`}
            >
              <Sun size={15} />
              <span>Modo Tereré Refrescante (Hielo)</span>
            </button>
            <button
              onClick={() => setMode("hot")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === "hot"
                  ? "bg-pava-green text-white shadow-md"
                  : "text-pava-brown/70 hover:text-pava-brown"
              }`}
            >
              <Flame size={15} />
              <span>Modo Mate Caliente (75°C - 80°C)</span>
            </button>
          </div>
        </div>

        {/* Dynamic Interactive Card */}
        <div className="rounded-3xl border border-pava-brown/12 bg-white p-6 sm:p-10 shadow-sm">
          {mode === "cold" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 border border-cyan-200 px-3 py-1 text-xs font-bold text-cyan-800">
                  <Droplets size={13} />
                  <span>Consejos para el Tereré Perfecto</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-pava-brown">
                  Tereré Patagónico: Frescura & Cero Acidez
                </h3>
                <p className="text-sm text-pava-brown-mid/80 leading-relaxed">
                  Ideal para días calurosos, tardes de río o caminatas. Acompañá con jugo de pomelo rosado, naranja natural, hojas de menta machacadas y abundante hielo en jarra o termo de boca ancha.
                </p>

                {/* 3 Step Formula */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="rounded-2xl bg-cyan-50/60 border border-cyan-100 p-3.5">
                    <span className="text-xs font-bold text-cyan-900 block mb-1">1. Yerba Gruesa</span>
                    <p className="text-[11px] text-cyan-800/80">Con palo o molienda gruesa para que no se tape con el frío.</p>
                  </div>
                  <div className="rounded-2xl bg-cyan-50/60 border border-cyan-100 p-3.5">
                    <span className="text-xs font-bold text-cyan-900 block mb-1">2. Hielo Primero</span>
                    <p className="text-[11px] text-cyan-800/80">Colocá 2 cubitos de hielo en el fondo del vaso antes de la yerba.</p>
                  </div>
                  <div className="rounded-2xl bg-cyan-50/60 border border-cyan-100 p-3.5">
                    <span className="text-xs font-bold text-cyan-900 block mb-1">3. Vaso Térmico</span>
                    <p className="text-[11px] text-cyan-800/80">Vaso de acero 304 que no condensa ni moja la mesa.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/catalogo"
                    className="inline-flex items-center gap-2 rounded-control bg-cyan-700 px-6 py-3 text-xs font-bold text-white hover:bg-cyan-800 transition-colors shadow-md"
                  >
                    <span>Ver Vasos Térmicos y Yerbas para Tereré</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 relative h-72 lg:h-96 rounded-2xl overflow-hidden bg-cyan-950/10 border border-cyan-900/10">
                <Image
                  src="/product_combo_kit_1786546132809.png"
                  alt="Terere y Vasos térmicos"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                  <Thermometer size={13} />
                  <span>El Ritual Caliente de Siempre</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-pava-brown">
                  Mate Tradicional: Espuma & Temperatura Óptima
                </h3>
                <p className="text-sm text-pava-brown-mid/80 leading-relaxed">
                  Calentá el agua entre <strong>75°C y 80°C</strong> (cuando empieza a murmurar la pava, antes del hervor). Hidratá la yerba con un chorrito tibio antes de acomodar la bombilla para no quemar la montañita.
                </p>

                {/* 3 Step Formula */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="rounded-2xl bg-emerald-50/60 border border-emerald-100 p-3.5">
                    <span className="text-xs font-bold text-emerald-950 block mb-1">1. Inclinación 45°</span>
                    <p className="text-[11px] text-emerald-900/80">Agitá el mate tapando la boca para formar la montañita.</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50/60 border border-emerald-100 p-3.5">
                    <span className="text-xs font-bold text-emerald-950 block mb-1">2. Agua Tibia</span>
                    <p className="text-[11px] text-emerald-900/80">Regá suavemente la base para expandir la hoja 2 minutos.</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50/60 border border-emerald-100 p-3.5">
                    <span className="text-xs font-bold text-emerald-950 block mb-1">3. Mate Imperial</span>
                    <p className="text-[11px] text-emerald-900/80">Calabaza gruesa con virola de alpaca cincelada.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/catalogo"
                    className="inline-flex items-center gap-2 rounded-control bg-pava-green px-6 py-3 text-xs font-bold text-pava-cream hover:bg-pava-green-light transition-colors shadow-md"
                  >
                    <span>Explorar Mates Imperiales y Termos</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 relative h-72 lg:h-96 rounded-2xl overflow-hidden bg-pava-green/10 border border-pava-green/10">
                <Image
                  src="/product_mate_imperial_1786546059296.png"
                  alt="Mate Imperial tradicional"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
