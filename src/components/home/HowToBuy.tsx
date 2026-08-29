"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Sparkles,
  MessageCircle,
  Truck,
  ArrowRight,
  CheckCircle,
  CreditCard,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import MagneticButton from "@/components/ui/MagneticButton";
import { BorderBeam } from "@/components/ui/BorderBeam";

interface StepItem {
  number: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  tag: string;
  title: string;
  description: string;
  feature: string;
  pillColor: string;
}

const STEPS: StepItem[] = [
  {
    number: "01",
    icon: ShoppingBag,
    tag: "Paso 1 · Exploración",
    title: "Elegí tus piezas favoritas",
    description: "Navegá nuestro catálogo de mates de calabaza, yerbas seleccionadas, termos y bombillas de alpaca.",
    feature: "Catálogo online en vivo",
    pillColor: "from-amber-400 to-amber-600",
  },
  {
    number: "02",
    icon: Sparkles,
    tag: "Paso 2 · Personalización",
    title: "Armá tu carrito a medida",
    description: "Agregá productos individuales o armá tu set personalizado con 10% de descuento automático.",
    feature: "Sin registros obligatorios",
    pillColor: "from-emerald-400 to-teal-600",
  },
  {
    number: "03",
    icon: MessageCircle,
    tag: "Paso 3 · Confirmación",
    title: "Enviá tu pedido por WhatsApp",
    description: "Tu selección se transforma en un mensaje ordenado. Te responde una persona real del local en minutos.",
    feature: "Atención humana instantánea",
    pillColor: "from-green-400 to-emerald-600",
  },
  {
    number: "04",
    icon: Truck,
    tag: "Paso 4 · Despacho o Retiro",
    title: "Elegí cómo recibir tu mate",
    description: "Coordinamos envío seguro a todo el país o retiro inmediato sin costo en nuestro local de Catriel.",
    feature: "Envíos a todo el país & Retiro",
    pillColor: "from-pava-gold to-amber-500",
  },
];

export default function HowToBuy() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <section
      id="como-comprar"
      className="relative overflow-hidden bg-[#0d1810] py-24 sm:py-28 lg:py-36 text-pava-cream border-y border-pava-gold/15"
    >
      {/* Dynamic ambient lighting */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-pava-gold/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-[550px] h-[550px] rounded-full bg-pava-green/20 blur-[140px] pointer-events-none" />
      <div className="bg-dots-pattern absolute inset-0 opacity-20 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section Header */}
        <ScrollReveal
          direction="up"
          className="mb-16 lg:mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-10 bg-pava-gold" />
              <span className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-pava-gold">
                Experiencia Sin Fricción
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[0.92] tracking-tight text-white">
              En cuatro pasos, <br />
              <em className="text-shine not-italic text-pava-gold">tu mate en camino.</em>
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-pava-cream/75 max-w-lg">
              Comprás fácil desde la web con atención personalizada. Sin formularios eternos, con asesoramiento humano y múltiples medios de pago.
            </p>
          </div>

          {/* Quick trust metrics */}
          <div className="hidden lg:flex items-center gap-6 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-2.5 text-xs text-pava-cream/90">
              <CreditCard size={16} className="text-pava-gold" />
              <span>3 Cuotas sin interés</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2.5 text-xs text-pava-cream/90">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Compra 100% segura</span>
            </div>
          </div>
        </ScrollReveal>

        {/* 4 Interactive Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 relative">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isHovered = hoveredStep === idx;

            return (
              <ScrollReveal
                key={step.number}
                direction="up"
                delay={idx * 90}
                className="h-full"
              >
                <div
                  onMouseEnter={() => setHoveredStep(idx)}
                  onMouseLeave={() => setHoveredStep(null)}
                  className={`group relative flex h-full flex-col justify-between rounded-2xl border p-6 sm:p-7 backdrop-blur-xl transition-all duration-400 overflow-hidden cursor-pointer ${
                    isHovered
                      ? "bg-white/10 border-pava-gold shadow-2xl shadow-pava-gold/15 -translate-y-2 scale-[1.02]"
                      : "bg-[#14261a]/80 border-white/12 hover:border-white/25 shadow-lg"
                  }`}
                >
                  {/* Glowing Border Beam on active/hovered step */}
                  {isHovered && (
                    <BorderBeam
                      size={200}
                      duration={6}
                      borderWidth={2}
                      colorFrom="#d39e4a"
                      colorTo="#52b788"
                    />
                  )}

                  <div>
                    {/* Top row: Step Number + Icon Badge */}
                    <div className="flex items-center justify-between mb-5">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.pillColor} text-pava-brown shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                      >
                        <Icon size={22} strokeWidth={2.2} />
                      </span>

                      <span className="font-display text-4xl font-extrabold tracking-tighter text-white/20 transition-colors duration-300 group-hover:text-pava-gold/60">
                        {step.number}
                      </span>
                    </div>

                    {/* Step Tag */}
                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-pava-gold mb-2">
                      {step.tag}
                    </span>

                    {/* Title & Description */}
                    <h3 className="font-display text-xl font-bold text-white mb-2.5 leading-snug group-hover:text-pava-gold transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] leading-relaxed text-pava-cream/75">
                      {step.description}
                    </p>
                  </div>

                  {/* Bottom Feature Pill */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                      <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                      <span>{step.feature}</span>
                    </span>

                    <span className="text-xs text-pava-gold opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 font-bold">
                      →
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Bottom Call to Action Bar */}
        <ScrollReveal
          direction="up"
          delay={250}
          className="mt-14 lg:mt-18 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl border border-white/12 bg-white/5 p-6 sm:p-8 backdrop-blur-xl"
        >
          <div className="text-center sm:text-left">
            <span className="text-xs font-bold text-pava-gold uppercase tracking-wider block mb-1">
              ¿Tenés dudas sobre qué mate elegir?
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
              Te asesoramos en el momento por WhatsApp
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <MagneticButton>
              <Link
                href="/catalogo"
                id="howtobuy-cta"
                className="cta-pulse-ring w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-control bg-pava-gold px-8 py-4 text-sm font-bold tracking-wide text-pava-brown shadow-xl shadow-pava-gold/15 transition-all duration-200 hover:bg-pava-gold-light active:scale-[0.98]"
              >
                <span>Empezar a elegir productos</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </MagneticButton>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
