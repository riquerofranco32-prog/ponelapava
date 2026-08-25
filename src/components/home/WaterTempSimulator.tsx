"use client";

import { useState } from "react";
import { Flame, Droplets, AlertTriangle, CheckCircle2, Sparkles, Thermometer } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { BorderBeam } from "@/components/ui/BorderBeam";

interface TempState {
  label: string;
  status: "cold" | "perfect" | "hot";
  color: string;
  badgeBg: string;
  summary: string;
  explanation: string;
  icon: string;
}

function getTempState(temp: number): TempState {
  if (temp < 72) {
    return {
      label: "Agua tibia / Fría",
      status: "cold",
      color: "#60a5fa",
      badgeBg: "rgba(96, 165, 250, 0.15)",
      summary: "No extrae el cuerpo ni los aromas",
      explanation: "A menos de 72°C la yerba no logra desprender sus polifenoles y antioxidantes. El mate queda 'lavado' desde las primeras cebadas y sin espuma.",
      icon: "❄️",
    };
  }
  if (temp <= 82) {
    return {
      label: "¡Punto Perfecto de Cebado!",
      status: "perfect",
      color: "#c7a67a",
      badgeBg: "rgba(199, 166, 122, 0.2)",
      summary: "Espuma sostenida, sabor redondo y sin acidez",
      explanation: "Entre 75°C y 80°C se produce la infusión ideal: la hoja rinde hasta 1.5 litros sin quemarse, el amargor es equilibrado y la montañita permanece seca.",
      icon: "🧉",
    };
  }
  return {
    label: "Agua Quemada / Hirviendo",
    status: "hot",
    color: "#f87171",
    badgeBg: "rgba(248, 113, 113, 0.15)",
    summary: "Quema la hoja, produce acidez y sabor astringente",
    explanation: "Por encima de 85°C el agua quema la clorofila de la yerba en el primer contacto. El mate se vuelve amargo en exceso, pierde todos los matices y se lava al tercer mate.",
    icon: "🔥",
  };
}

export default function WaterTempSimulator({ embedded = false }: { embedded?: boolean }) {
  const [temp, setTemp] = useState(78);
  const state = getTempState(temp);

  const cardContent = (
    <div className="max-w-3xl mx-auto">
      <div className="relative rounded-card border border-pava-brown/15 bg-white p-7 sm:p-12 shadow-xl backdrop-blur-md overflow-hidden">
        <BorderBeam
          size={200}
          duration={10}
          borderWidth={1.5}
          colorFrom={state.color}
          colorTo="transparent"
        />

        {/* Temperature Big Display */}
        <div className="flex flex-col items-center text-center mb-8">
          <span className="text-4xl sm:text-5xl mb-3 animate-float-slow">
            {state.icon}
          </span>

          <div className="flex items-baseline justify-center gap-1">
            <span
              className="font-display text-6xl sm:text-7xl font-extrabold tracking-tight transition-colors duration-300"
              style={{ color: state.color }}
            >
              {temp}
            </span>
            <span className="font-display text-3xl sm:text-4xl font-bold text-pava-brown/60">
              °C
            </span>
          </div>

          <div
            className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider transition-all duration-300"
            style={{ background: state.badgeBg, color: state.color }}
          >
            {state.status === "perfect" && <Sparkles size={13} />}
            {state.status === "cold" && <Droplets size={13} />}
            {state.status === "hot" && <AlertTriangle size={13} />}
            <span>{state.label}</span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="mb-10 max-w-lg mx-auto">
          <div className="relative flex items-center">
            <input
              type="range"
              min={60}
              max={95}
              step={1}
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              aria-label="Temperatura del agua en grados Celsius"
              className="w-full h-3 bg-pava-cream-dark rounded-lg appearance-none cursor-pointer accent-pava-green focus:outline-none"
            />
          </div>

          {/* Slider scale markers */}
          <div className="flex justify-between items-center text-[11px] font-bold text-pava-brown-mid/60 mt-3 px-1">
            <span className="hover:text-pava-brown cursor-pointer" onClick={() => setTemp(65)}>65°C (Tibia)</span>
            <span
              className="hover:text-pava-gold-deep cursor-pointer font-extrabold text-pava-gold-deep flex items-center gap-1"
              onClick={() => setTemp(78)}
            >
              ★ 75°–80°C (Ideal)
            </span>
            <span className="hover:text-pava-brown cursor-pointer" onClick={() => setTemp(90)}>90°C+ (Hirviendo)</span>
          </div>
        </div>

        {/* Explanation Box */}
        <div
          className="rounded-control border p-5 sm:p-6 transition-all duration-300"
          style={{
            borderColor: `${state.color}40`,
            backgroundColor: `${state.color}08`,
          }}
        >
          <div className="flex items-center gap-2 font-display text-lg font-bold text-pava-brown mb-2">
            <span>{state.summary}</span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-pava-brown-mid/85 font-medium">
            {state.explanation}
          </p>
        </div>

        {/* Pro Tips Footer */}
        <div className="mt-8 pt-6 border-t border-pava-brown/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-pava-brown-mid/75">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={15} className="text-pava-green shrink-0 mt-0.5" />
            <span><strong>Para yerbas uruguayas (Canarias/Sara):</strong> 74°C a 78°C para abrir la hoja sin compactar el polvillo.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={15} className="text-pava-green shrink-0 mt-0.5" />
            <span><strong>Para yerbas argentinas (Playadito/Amanda):</strong> 78°C a 82°C para extraer la madera y aromas serranos.</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return cardContent;
  }

  return (
    <section className="relative overflow-hidden bg-pava-cream-dark/60 py-24 sm:py-28 lg:py-36 border-b border-pava-brown/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <ScrollReveal direction="up" className="mb-14 text-center max-w-2xl mx-auto">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-9 bg-pava-gold-deep" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-gold-deep">
              Laboratorio Matero
            </span>
            <span className="h-px w-9 bg-pava-gold-deep" />
          </div>
          <h2 className="font-display text-4xl font-bold leading-[0.93] tracking-tight text-pava-brown sm:text-5xl lg:text-6xl">
            El secreto está
            <br />
            <em className="not-italic text-pava-green">en la temperatura.</em>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-pava-brown-mid/75">
            Deslizá el control para ver cómo cambia el rendimiento de tu yerba según los grados del agua:
          </p>
        </ScrollReveal>

        <ScrollReveal direction="scale" delay={100}>
          {cardContent}
        </ScrollReveal>
      </div>
    </section>
  );
}
