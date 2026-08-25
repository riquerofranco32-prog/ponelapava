"use client";

import { useState } from "react";
import { Sparkles, Flame, HelpCircle, Layers, Droplets, BookOpen } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import MateAnatomy from "@/components/home/MateAnatomy";
import RitualMastery from "@/components/home/RitualMastery";
import WaterTempSimulator from "@/components/home/WaterTempSimulator";
import CuringGuide from "@/components/home/CuringGuide";
import MateMatcher from "@/components/home/MateMatcher";
import YerbaProfileSelector from "@/components/home/YerbaProfileSelector";

type HubTab = "anatomy" | "yerbas" | "quiz" | "temp" | "curing" | "ritual";

interface TabItem {
  id: HubTab;
  name: string;
  badge: string;
  icon: string;
}

const TABS: TabItem[] = [
  {
    id: "anatomy",
    name: "Anatomía del Mate",
    badge: "Detalle & Piezas",
    icon: "🧉",
  },
  {
    id: "yerbas",
    name: "Perfiles de Yerba",
    badge: "Cata & Paladar",
    icon: "🍃",
  },
  {
    id: "quiz",
    name: "Test: Tu Mate Ideal",
    badge: "Recomendador",
    icon: "✨",
  },
  {
    id: "temp",
    name: "Temperatura del Agua",
    badge: "Laboratorio",
    icon: "🌡️",
  },
  {
    id: "curing",
    name: "Guía de Curado",
    badge: "Paso a paso",
    icon: "🪵",
  },
  {
    id: "ritual",
    name: "La Montañita Pro",
    badge: "Técnica de cebado",
    icon: "⛰️",
  },
];

export default function MateroExperienceHub() {
  const [activeTab, setActiveTab] = useState<HubTab>("anatomy");

  return (
    <section id="experiencia-matera" className="relative overflow-hidden bg-pava-cream-dark/40 py-20 sm:py-24 lg:py-28 border-b border-pava-brown/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Hub Header */}
        <ScrollReveal direction="up" className="mb-10 text-center max-w-2xl mx-auto">
          <div className="mb-3.5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-pava-gold-deep" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-gold-deep">
              Academia Poné La Pava
            </span>
            <span className="h-px w-8 bg-pava-gold-deep" />
          </div>
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-pava-brown sm:text-4xl lg:text-5xl">
            Cultura & Secretos
            <br />
            <em className="not-italic text-pava-green">para el mate perfecto.</em>
          </h2>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-pava-brown-mid/75">
            Elegí qué querés descubrir: anatomía de autor, temperatura ideal, curado tradicional o hacé el test para tu próximo mate.
          </p>
        </ScrollReveal>

        {/* Tab Navigation Strip */}
        <ScrollReveal direction="up" delay={60} className="mb-10">
          <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-2 scrollbar-none">
            <div className="inline-flex max-w-full p-1.5 rounded-card bg-pava-cream border border-pava-brown/12 shadow-sm gap-1.5 shrink-0">
              {TABS.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 rounded-control px-3.5 py-2.5 sm:px-4 text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-pava-green text-pava-cream shadow-md shadow-pava-green/25 scale-[1.02]"
                        : "text-pava-brown hover:text-pava-green hover:bg-pava-cream-dark/50"
                    }`}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <div className="text-left">
                      <span className="block leading-none">{tab.name}</span>
                      <span
                        className={`text-[9px] uppercase tracking-wider font-semibold block mt-0.5 ${
                          isActive ? "text-pava-gold" : "text-pava-brown-mid/50"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Active Tab Content Container */}
        <div className="transition-all duration-300">
          {activeTab === "anatomy" && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <MateAnatomy embedded />
            </div>
          )}
          {activeTab === "yerbas" && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <YerbaProfileSelector embedded />
            </div>
          )}
          {activeTab === "quiz" && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <MateMatcher embedded />
            </div>
          )}
          {activeTab === "temp" && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <WaterTempSimulator embedded />
            </div>
          )}
          {activeTab === "curing" && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <CuringGuide embedded />
            </div>
          )}
          {activeTab === "ritual" && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <RitualMastery embedded />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
