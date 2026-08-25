"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Check, Compass, Eye } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { BorderBeam } from "@/components/ui/BorderBeam";

interface Step {
  number: string;
  badge: string;
  title: string;
  shortDesc: string;
  fullTip: string;
  angleText: string;
}

const RITUAL_STEPS: Step[] = [
  {
    number: "01",
    badge: "Paso 1 · El Sacudón",
    title: "Agitar a 45° con la palma",
    shortDesc: "Tapá la boca del mate con la palma y sacudilo enérgicamente varias veces.",
    fullTip: "Este movimiento hace que el polvillo más fino suba a la superficie y las hojas más gruesas queden abajo. Evita que el mate se tape desde el primer sorbo.",
    angleText: "Inclinación: 45°",
  },
  {
    number: "02",
    badge: "Paso 2 · La Montañita",
    title: "Crear la ladera seca",
    shortDesc: "Acomodá la yerba inclinada hacia un lateral dejando un hueco profundo en la base.",
    fullTip: "Esa pared seca es tu reserva de yerba nueva. A medida que cebes, irás mojando de a poco esa ladera para que la mateada dure el doble sin lavarse.",
    angleText: "Reserva 50% seca",
  },
  {
    number: "03",
    badge: "Paso 3 · El Primer Chorro",
    title: "Agua tibia en el hueco",
    shortDesc: "Verté un chorrito de agua tibia (no caliente) en la parte baja y dejá reposar 2 minutos.",
    fullTip: "La yerba absorbe el agua tibia, se hincha y crea un tapón natural. Si usás agua hirviendo acá, quemás la yerba antes de empezar.",
    angleText: "Reposo: 120 seg",
  },
  {
    number: "04",
    badge: "Paso 4 · Introducir Bombilla",
    title: "Tapar el orificio con el pulgar",
    shortDesc: "Tapá el pico de la bombilla con el dedo pulgar y clavala firme hasta el fondo.",
    fullTip: "Al tapar la entrada de aire generás un vacío que impide que el polvillo ingrese a la bombilla al clavarla. Una vez en su lugar: ¡prohibido moverla!",
    angleText: "Regla de oro: No tocar",
  },
];

export default function RitualMastery({ embedded = false }: { embedded?: boolean }) {
  const [activeStep, setActiveStep] = useState(0);
  const current = RITUAL_STEPS[activeStep];

  const content = (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 items-center">
      {/* Step Selector List */}
      <div className="lg:col-span-6 space-y-4">
        {RITUAL_STEPS.map((step, idx) => {
          const isActive = idx === activeStep;
          return (
            <ScrollReveal key={step.number} direction="left" delay={idx * 60}>
              <button
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`w-full flex items-start gap-4 p-5 rounded-card border-2 text-left transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "border-pava-gold bg-pava-green-dark/80 shadow-xl shadow-black/20 translate-x-2"
                    : "border-pava-cream/10 bg-pava-green-dark/30 hover:border-pava-cream/30 hover:bg-pava-green-dark/50"
                }`}
              >
                <span
                  className={`font-display text-2xl font-extrabold transition-colors ${
                    isActive ? "text-pava-gold" : "text-pava-cream/30"
                  }`}
                >
                  {step.number}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pava-gold">
                      {step.badge}
                    </span>
                    <span className="text-[11px] font-semibold text-pava-cream/50">
                      {step.angleText}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-pava-cream">
                    {step.title}
                  </h3>
                  <p className="text-xs text-pava-cream/70 mt-1 leading-relaxed">
                    {step.shortDesc}
                  </p>
                </div>
              </button>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Masterclass Showcase Card */}
      <ScrollReveal direction="right" delay={100} className="lg:col-span-6">
        <div className="relative rounded-card border border-pava-gold/30 bg-pava-green-dark/90 p-8 sm:p-12 shadow-2xl backdrop-blur-md overflow-hidden">
          <BorderBeam
            size={260}
            duration={12}
            borderWidth={1.5}
            colorFrom="#c7a67a"
            colorTo="transparent"
          />

          <div className="flex items-center justify-between mb-6 pb-4 border-b border-pava-cream/15">
            <span className="inline-flex items-center gap-2 rounded-full border border-pava-gold/40 bg-pava-gold/15 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-pava-gold">
              <Sparkles size={13} />
              Regla de Maestro Cebador
            </span>
            <span className="font-display text-3xl font-extrabold text-pava-gold/30">
              {current.number}
            </span>
          </div>

          <h3 className="font-display text-2xl sm:text-3xl font-bold text-pava-cream mb-2">
            {current.title}
          </h3>
          <p className="text-xs font-bold uppercase tracking-widest text-pava-gold mb-6">
            {current.angleText}
          </p>

          <div className="rounded-control border border-pava-cream/15 bg-pava-green/40 p-6 mb-8">
            <p className="text-sm sm:text-base leading-relaxed text-pava-cream/90 font-medium">
              &ldquo;{current.fullTip}&rdquo;
            </p>
          </div>

          {/* Progress bar across 4 steps */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {RITUAL_STEPS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveStep(i)}
                  aria-label={`Ir al paso ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    i === activeStep
                      ? "w-10 bg-pava-gold"
                      : i < activeStep
                        ? "w-3 bg-pava-cream/60"
                        : "w-2 bg-pava-cream/20"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveStep((prev) => (prev + 1) % RITUAL_STEPS.length)}
              className="inline-flex items-center gap-2 text-xs font-bold text-pava-gold hover:text-pava-gold-light transition-colors cursor-pointer"
            >
              Siguiente paso <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <section className="relative overflow-hidden bg-pava-green py-24 sm:py-28 lg:py-36 text-pava-cream border-b border-pava-cream/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <ScrollReveal direction="up" className="mb-14 max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-9 bg-pava-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-gold">
              Técnica del Cebador Pro
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold leading-[0.93] tracking-tight text-pava-cream sm:text-5xl lg:text-6xl">
            El arte de la montañita,
            <br />
            <em className="not-italic text-pava-gold">el mate que no se lava.</em>
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-pava-cream/75 max-w-lg">
            4 secretos transmitidos entre rondas para lograr espuma cremosa y mates interminables.
          </p>
        </ScrollReveal>
        {content}
      </div>
    </section>
  );
}
