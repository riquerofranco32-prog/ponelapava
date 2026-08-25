"use client";

import { useState } from "react";
import { Sparkles, CheckCircle2, AlertCircle, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Link from "next/link";

interface GuideStep {
  title: string;
  desc: string;
  time: string;
}

interface MaterialGuide {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  badge: string;
  steps: GuideStep[];
  proTip: string;
}

const GUIDES: MaterialGuide[] = [
  {
    id: "calabaza",
    name: "Mate de Calabaza",
    icon: "🧉",
    tagline: "El ritual tradicional que mejora con cada ronda",
    badge: "Requiere curado previo",
    steps: [
      {
        title: "1. Llenado inicial",
        desc: "Llená el mate hasta el borde con yerba usada aún tibia (de una mateada previa). Agregá un chorrito de agua tibia para humedecer.",
        time: "5 minutos",
      },
      {
        title: "2. Reposo de 24 horas",
        desc: "Dejalo reposar durante 24 horas en un lugar seco. A medida que absorba, agregá unas gotas de agua tibia si se seca.",
        time: "24 horas",
      },
      {
        title: "3. Raspado interior",
        desc: "Vaciá el mate y con una cuchara sopera raspá suavemente las paredes interiores para desprender el hollejo natural de la calabaza.",
        time: "5 minutos",
      },
      {
        title: "4. Repetir y listo",
        desc: "Repetí el proceso una o dos veces más. Cuando las paredes queden lisas y teñidas de verde, ¡tu mate está curado para toda la vida!",
        time: "Listo para usar",
      },
    ],
    proTip: "Nunca uses agua hirviendo para curar la calabaza, ya que puede rajar el fruto o aflojar la virola.",
  },
  {
    id: "madera",
    name: "Madera / Palo Santo",
    icon: "🪵",
    tagline: "Aroma silvestre, robustez y calidez noble",
    badge: "Curado con materia grasa",
    steps: [
      {
        title: "1. Sellado con aceite o manteca",
        desc: "Untá todo el interior del mate con una capa fina de manteca, aceite neutro de cocina o grasa vacuna. Esto sella los poros de la madera.",
        time: "5 minutos",
      },
      {
        title: "2. Reposo de hidratación",
        desc: "Dejá que la madera absorba la materia grasa durante 24 horas. Evita que la madera se reseque o se raje con los cambios de temperatura.",
        time: "24 horas",
      },
      {
        title: "3. Enjuague con yerba",
        desc: "Llenalo con yerba usada tibia durante 12 horas más para que adquiera el sabor clásico del mate y retire el excedente de aceite.",
        time: "12 horas",
      },
      {
        title: "4. Enjuague final",
        desc: "Enjuagá con agua tibia sin detergente, secá bien con una servilleta y ¡ya podés cebar tu primer mate!",
        time: "Listo para usar",
      },
    ],
    proTip: "No dejes el mate de madera secando al sol directo ni cerca de calefactores para evitar grietas.",
  },
  {
    id: "acero",
    name: "Acero / Térmico",
    icon: "🛡️",
    tagline: "Práctico, higiénico e inalterable",
    badge: "Sin curado previo",
    steps: [
      {
        title: "1. Lavado inicial",
        desc: "Lavalo con agua tibia y una gota de detergente neutro antes del primer uso.",
        time: "2 minutos",
      },
      {
        title: "2. Enjuague abundante",
        desc: "Enjuagá con abundante agua corriente para retirar cualquier residuo de jabón.",
        time: "1 minuto",
      },
      {
        title: "3. Listo para cebar",
        desc: "No absorbe olores, no junta hongos y no requiere ningún proceso de curado. ¡Podés empezar a usarlo al instante!",
        time: "Inmediato",
      },
      {
        title: "4. Mantenimiento fácil",
        desc: "Ideal para el auto, la oficina o viajes. Se limpia en segundos y conserva la temperatura por horas.",
        time: "Siempre listo",
      },
    ],
    proTip: "Podés alternar entre yerbas tradicionales y saborizadas sin que se mezclen los sabores entre mateadas.",
  },
];

export default function CuringGuide() {
  const [selectedId, setSelectedId] = useState<string>("calabaza");
  const currentGuide = GUIDES.find((g) => g.id === selectedId) ?? GUIDES[0];

  return (
    <section id="guia-curado" className="relative overflow-hidden bg-pava-cream py-24 sm:py-28 lg:py-36 border-b border-pava-brown/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <ScrollReveal direction="up" className="mb-14 text-center max-w-2xl mx-auto">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-9 bg-pava-gold-deep" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-gold-deep">
              Secretos de la casa
            </span>
            <span className="h-px w-9 bg-pava-gold-deep" />
          </div>
          <h2 className="font-display text-4xl font-bold leading-[0.93] tracking-tight text-pava-brown sm:text-5xl lg:text-6xl">
            Cómo curar tu mate,
            <br />
            <em className="not-italic text-pava-green">paso a paso.</em>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-pava-brown-mid/75">
            Un buen curado define el sabor, la durabilidad y la nobleza de tu mate para toda la vida. Elegí el material de tu mate:
          </p>
        </ScrollReveal>

        {/* Material Tabs */}
        <ScrollReveal direction="up" delay={80} className="mb-10 flex flex-wrap justify-center gap-3">
          {GUIDES.map((guide) => {
            const isSelected = guide.id === selectedId;
            return (
              <button
                key={guide.id}
                type="button"
                onClick={() => setSelectedId(guide.id)}
                className={`flex items-center gap-3 rounded-control border-2 px-6 py-3.5 text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-pava-green bg-pava-green text-pava-cream shadow-md shadow-pava-green/20 scale-[1.02]"
                    : "border-pava-brown/15 bg-white text-pava-brown hover:border-pava-green/50 hover:bg-pava-cream-dark/30"
                }`}
              >
                <span className="text-xl">{guide.icon}</span>
                <span>{guide.name}</span>
              </button>
            );
          })}
        </ScrollReveal>

        {/* Steps Grid */}
        <ScrollReveal direction="scale" delay={120}>
          <div className="rounded-card border border-pava-brown/12 bg-white p-6 sm:p-10 shadow-lg">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pava-brown/10 pb-6">
              <div>
                <span className="inline-block rounded-chip bg-pava-gold/15 border border-pava-gold/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-pava-gold-deep mb-2">
                  {currentGuide.badge}
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-pava-brown">
                  {currentGuide.name}
                </h3>
                <p className="text-xs sm:text-sm text-pava-brown-mid/75 mt-0.5">
                  {currentGuide.tagline}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-control bg-pava-cream-dark/50 border border-pava-brown/10 px-4 py-2 text-xs font-semibold text-pava-brown">
                <ShieldCheck size={16} className="text-pava-green" />
                <span>Garantía de sabor</span>
              </div>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {currentGuide.steps.map((step, i) => (
                <div
                  key={step.title}
                  className="relative flex flex-col justify-between rounded-control border border-pava-brown/10 bg-pava-cream/20 p-5 transition-all hover:bg-pava-cream/40"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pava-green text-pava-cream text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-pava-gold-deep bg-pava-gold/10 px-2 py-0.5 rounded-chip">
                        <Clock size={11} /> {step.time}
                      </span>
                    </div>
                    <h4 className="font-display text-base font-bold text-pava-brown mb-2">
                      {step.title}
                    </h4>
                    <p className="text-xs leading-relaxed text-pava-brown-mid/80">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pro Tip Box */}
            <div className="mt-8 flex items-start gap-3.5 rounded-control border border-pava-gold/40 bg-pava-gold/10 p-4 sm:p-5 text-pava-brown">
              <Sparkles size={20} className="shrink-0 text-pava-gold-deep mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-pava-gold-deep block mb-1">
                  Consejo de cebador Poné La Pava
                </span>
                <p className="text-xs sm:text-sm text-pava-brown-mid/90 leading-relaxed font-medium">
                  {currentGuide.proTip}
                </p>
              </div>
            </div>

            {/* Bottom action */}
            <div className="mt-8 pt-6 border-t border-pava-brown/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-pava-brown-mid/70 text-center sm:text-left">
                ¿Tenés dudas sobre cómo curar un modelo específico? Escribinos por WhatsApp y te asesoramos al instante.
              </p>
              <Link
                href="/catalogo?cat=mates"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-pava-green hover:text-pava-terracotta transition-colors shrink-0"
              >
                Ver todos los mates <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
