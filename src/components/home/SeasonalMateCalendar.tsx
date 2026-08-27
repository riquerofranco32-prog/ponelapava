"use client";

import { useState, useEffect } from "react";
import { Thermometer, Snowflake, Leaf, Flower2, Sun } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Link from "next/link";

type SeasonId = "verano" | "otono" | "invierno" | "primavera";

interface ProductRec {
  name: string;
  tag: string;
  emoji: string;
}

interface Season {
  id: SeasonId;
  name: string;
  months: string;
  tagline: string;
  description: string;
  temp: string;
  products: ProductRec[];
  ritual: string;
  bgGradient: string;
  textColor: string;
  badgeColor: string;
  accentColor: string;
}

const SEASONS: Season[] = [
  {
    id: "verano",
    name: "Verano",
    months: "Dic · Ene · Feb",
    tagline: "El tereré manda 🧊",
    description:
      "Con 40° a la sombra, el ritual se transforma: agua helada, yerbas mentoladas y fruta. El tereré no es resignación — es arte.",
    temp: "36–42°C",
    products: [
      { name: "Yerba de Menta & Boldo", tag: "Infusión fría", emoji: "🍃" },
      { name: "Termo doble pared XL", tag: "Hielo toda la tarde", emoji: "🧊" },
      { name: "Bombilla filtro ancho", tag: "Tereré fluido", emoji: "🥤" },
      { name: "Mate de cerámica", tag: "No se calienta", emoji: "🧉" },
    ],
    ritual:
      "Llenás el mate a ¾ de yerba fría, colocás una rodaja de limón al fondo y agregás agua helada con hielo picado. Cada sorbo: puro frescor patagónico.",
    bgGradient: "from-amber-50 via-orange-50 to-yellow-50",
    textColor: "text-amber-900",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    accentColor: "#D97706",
  },
  {
    id: "otono",
    name: "Otoño",
    months: "Mar · Abr · May",
    tagline: "Yerba fuerte, mano firme 🍂",
    description:
      "Las hojas caen y el mate se vuelve filosofía. Yerbas con palo suaves, temperatura justa. El momento de conocer tu estilo.",
    temp: "70–75°C",
    products: [
      { name: "Yerba con palo premium", tag: "Equilibrio perfecto", emoji: "🌿" },
      { name: "Mate de madera algarrobo", tag: "Sabor a campo", emoji: "🪵" },
      { name: "Termo de acero 1L", tag: "Larga duración", emoji: "🔥" },
      { name: "Bombilla de alpaca", tag: "Clásico eterno", emoji: "✨" },
    ],
    ritual:
      "Temperatura del agua a punto vela (70–75°C). Vertís despacio sobre la yerba humectada. La ceba dura más, el sabor se vuelve más profundo.",
    bgGradient: "from-orange-50 via-amber-50 to-stone-50",
    textColor: "text-orange-900",
    badgeColor: "bg-orange-100 text-orange-900 border-orange-200",
    accentColor: "#92400E",
  },
  {
    id: "invierno",
    name: "Invierno",
    months: "Jun · Jul · Ago",
    tagline: "Mate caliente, manos tibias ❄️",
    description:
      "La hora del mate fuerte. Yerbas con mucho palo, agua casi a punto de hervor. La ronda dura horas. Nadie tiene frío.",
    temp: "78–82°C",
    products: [
      { name: "Yerba con palo fuerte", tag: "Cuerpo y calidez", emoji: "☕" },
      { name: "Mate de calabaza curado", tag: "Sabor tradicional", emoji: "🎃" },
      { name: "Termo 1.5L – reserva", tag: "Para toda la tarde", emoji: "🧳" },
      { name: "Zuccardito calentador", tag: "El extra invernal", emoji: "🔶" },
    ],
    ritual:
      "Agua sin hervir (80°C máx.) para no quemar la yerba. Mate curado con grasa de cerdo. Una ronda puede durar 3 horas sin perder sabor.",
    bgGradient: "from-blue-50 via-indigo-50 to-slate-50",
    textColor: "text-blue-900",
    badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
    accentColor: "#1E40AF",
  },
  {
    id: "primavera",
    name: "Primavera",
    months: "Sep · Oct · Nov",
    tagline: "Florecé con el mate 🌸",
    description:
      "Yerbas suaves con hierbas aromáticas. El momento ideal para iniciar a alguien en la cultura matrera. Todo empieza en primavera.",
    temp: "72–76°C",
    products: [
      { name: "Yerba menta & manzanilla", tag: "Aromática & suave", emoji: "🌼" },
      { name: "Mate de vidrio artesanal", tag: "Ver el sabor", emoji: "🫙" },
      { name: "Kit iniciación completo", tag: "Para el que empieza", emoji: "🎁" },
      { name: "Bombilla filtrante fina", tag: "Sin amargo", emoji: "💎" },
    ],
    ritual:
      "Empezás con agua tibia (72°C) y yerba suave. Ideal para compartir afuera con el sol. El mate más social, el más fácil de compartir.",
    bgGradient: "from-emerald-50 via-green-50 to-teal-50",
    textColor: "text-emerald-900",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-200",
    accentColor: "#059669",
  },
];

const SEASON_ICONS: Record<SeasonId, React.ReactNode> = {
  verano: <Sun size={20} />,
  otono: <Leaf size={20} />,
  invierno: <Snowflake size={20} />,
  primavera: <Flower2 size={20} />,
};

function getCurrentSeason(): SeasonId {
  const month = new Date().getMonth() + 1;
  if (month >= 12 || month <= 2) return "verano";
  if (month >= 3 && month <= 5) return "otono";
  if (month >= 6 && month <= 8) return "invierno";
  return "primavera";
}

export default function SeasonalMateCalendar() {
  const [active, setActive] = useState<SeasonId>("invierno");

  useEffect(() => {
    setActive(getCurrentSeason());
  }, []);

  const currentSeasonId = getCurrentSeason();
  const season = SEASONS.find((s) => s.id === active) ?? SEASONS[0];

  return (
    <section
      id="calendario-matero"
      className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28 border-b border-pava-brown/10"
    >
      {/* Subtle background dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-pava-brown) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <ScrollReveal direction="up" className="mb-10 text-center max-w-2xl mx-auto">
          <div className="mb-3.5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-pava-gold-deep" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-gold-deep">
              Guía Estacional
            </span>
            <span className="h-px w-8 bg-pava-gold-deep" />
          </div>
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-pava-brown sm:text-4xl lg:text-5xl">
            Cada estación tiene
            <br />
            <em className="not-italic text-pava-green">su mate ideal.</em>
          </h2>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-pava-brown-mid/75">
            Del tereré helado del verano al mate humeante del invierno — la cultura
            matera cambia con las estaciones. Descubrí qué tomás ahora.
          </p>
        </ScrollReveal>

        {/* Season selector tabs */}
        <ScrollReveal direction="up" delay={60} className="mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            {SEASONS.map((s) => {
              const isActive = s.id === active;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActive(s.id)}
                  style={isActive ? { borderColor: s.accentColor, color: s.accentColor } : undefined}
                  className={`relative flex items-center gap-2 rounded-control px-4 py-2.5 text-sm font-bold border-2 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-white shadow-md scale-[1.04]"
                      : "border-pava-brown/15 text-pava-brown/70 bg-white hover:border-pava-brown/40 hover:text-pava-brown"
                  }`}
                  aria-pressed={isActive}
                >
                  <span aria-hidden="true">{SEASON_ICONS[s.id]}</span>
                  <span>{s.name}</span>
                  {s.id === currentSeasonId && (
                    <span
                      className="absolute -top-1.5 -right-1.5 flex h-3 w-3"
                      aria-label="Estación actual"
                    >
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pava-green opacity-60" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-pava-green" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Season content card */}
        <ScrollReveal direction="scale" delay={80}>
          <div
            key={season.id}
            className={`rounded-card bg-gradient-to-br ${season.bgGradient} border border-pava-brown/8 p-6 sm:p-8 lg:p-10 shadow-sm`}
          >
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
              {/* Left: Main info */}
              <div className="lg:col-span-2 space-y-5">
                {/* Top meta chips */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${season.badgeColor}`}
                  >
                    {SEASON_ICONS[season.id]}
                    {season.months}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${season.badgeColor}`}
                  >
                    <Thermometer size={12} />
                    Agua: {season.temp}
                  </span>
                </div>

                {/* Season name + tagline */}
                <div>
                  <h3
                    className={`font-display text-4xl sm:text-5xl font-bold leading-none tracking-tight ${season.textColor}`}
                  >
                    {season.name}
                  </h3>
                  <p className={`mt-1.5 text-base sm:text-lg font-semibold ${season.textColor} opacity-70`}>
                    {season.tagline}
                  </p>
                </div>

                {/* Description */}
                <p className={`text-sm sm:text-base leading-relaxed ${season.textColor} opacity-80`}>
                  {season.description}
                </p>

                {/* Ritual box */}
                <div className="rounded-control bg-white/70 backdrop-blur-sm border border-pava-brown/10 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pava-gold-deep mb-2">
                    🧉 El ritual de la estación
                  </p>
                  <p className={`text-sm leading-relaxed ${season.textColor} opacity-85 font-medium`}>
                    {season.ritual}
                  </p>
                </div>
              </div>

              {/* Right: Product recommendations */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pava-gold-deep">
                  Tu arsenal de {season.name.toLowerCase()}
                </p>
                <div className="space-y-2.5">
                  {season.products.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-control bg-white/80 backdrop-blur-sm border border-pava-brown/8 px-3.5 py-3 shadow-xs hover:shadow-sm transition-all duration-200 hover:scale-[1.01]"
                    >
                      <span className="text-2xl shrink-0">{p.emoji}</span>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold leading-tight ${season.textColor}`}>
                          {p.name}
                        </p>
                        <p className="text-[11px] text-pava-brown-mid/60 font-medium">
                          {p.tag}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/catalogo"
                  style={{ borderColor: season.accentColor, color: season.accentColor }}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-control border-2 bg-white/80 px-5 py-3 text-sm font-bold transition-all duration-200 hover:opacity-80 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Ver en catálogo →
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
