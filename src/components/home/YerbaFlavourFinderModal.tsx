"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Leaf,
  ShieldCheck,
  Flame,
  ShoppingBag,
  ArrowRight,
  RotateCcw,
  Check,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface YerbaProfile {
  name: string;
  brand: string;
  slug: string;
  image: string;
  price: number;
  intensity: "suave" | "medio" | "intenso";
  digestive: "cero_acidez" | "despalada" | "compuesta";
  drying: "estandar" | "natural" | "barbacua";
  description: string;
  tagline: string;
}

const YERBA_DATABASE: YerbaProfile[] = [
  {
    name: "Yerba Mate Amanda Selección Especial 500g",
    brand: "Amanda",
    slug: "yerba-amanda-500g",
    image: "/product_yerba_amanda_1786546104213.png",
    price: 3200,
    intensity: "medio",
    digestive: "cero_acidez",
    drying: "natural",
    description: "Estacionamiento natural de 18 meses. Molienda uniforme con bajo contenido de polvo, ideal para no generar acidez.",
    tagline: "Equilibrada & Amigable al estómago",
  },
  {
    name: "Yerba Mate Canarias Especial 1kg",
    brand: "Canarias",
    slug: "yerba-amanda-500g",
    image: "/product_yerba_amanda_1786546104213.png",
    price: 6800,
    intensity: "intenso",
    digestive: "despalada",
    drying: "natural",
    description: "Pura hoja seleccionada sin palo tipo uruguaya. Sabor persistente, amargo pronunciado y máxima duración de espuma.",
    tagline: "Fuerte & Duradera",
  },
  {
    name: "Yerba Mate Barbacuá Ahumada Artesanal 500g",
    brand: "Sol y Lluvia",
    slug: "yerba-amanda-500g",
    image: "/product_yerba_amanda_1786546104213.png",
    price: 4500,
    intensity: "intenso",
    digestive: "cero_acidez",
    drying: "barbacua",
    description: "Secado lento a leña durante 24 horas. Notas ahumadas tostadas incomparables con 24 meses de estacionamiento.",
    tagline: "Ahumada tradicional Barbacuá",
  },
  {
    name: "Yerba Mate Playadito Tradicional 1kg",
    brand: "Playadito",
    slug: "yerba-amanda-500g",
    image: "/product_yerba_amanda_1786546104213.png",
    price: 5400,
    intensity: "suave",
    digestive: "cero_acidez",
    drying: "estandar",
    description: "El clásico argentino de sabor suave y dulce natural. Hojas finamente estacionadas para una cebada sedosa.",
    tagline: "Suave & Dulce Natural",
  },
  {
    name: "Yerba Mate Serrana con Hierbas Digestivas 500g",
    brand: "CBSé / Patagonia",
    slug: "yerba-amanda-500g",
    image: "/product_yerba_amanda_1786546104213.png",
    price: 3600,
    intensity: "suave",
    digestive: "compuesta",
    drying: "estandar",
    description: "Mezcla de yerba con menta, manzanilla, poleo y cedrón. Refrescante, digestiva e ideal para sobremesas.",
    tagline: "Digestiva & Aromática",
  },
];

export default function YerbaFlavourFinderModal() {
  const [intensity, setIntensity] = useState<"suave" | "medio" | "intenso">("medio");
  const [digestive, setDigestive] = useState<"cero_acidez" | "despalada" | "compuesta">("cero_acidez");
  const [drying, setDrying] = useState<"estandar" | "natural" | "barbacua">("natural");
  const [added, setAdded] = useState(false);
  const { addItem, setDrawer } = useCart();

  // Find best matching yerba from database
  const getBestMatch = (): YerbaProfile => {
    // Score each yerba based on user choices
    let best = YERBA_DATABASE[0];
    let maxScore = -1;

    for (const y of YERBA_DATABASE) {
      let score = 0;
      if (y.intensity === intensity) score += 3;
      if (y.digestive === digestive) score += 3;
      if (y.drying === drying) score += 2;

      if (score > maxScore) {
        maxScore = score;
        best = y;
      }
    }
    return best;
  };

  const match = getBestMatch();

  const handleAddToCart = () => {
    addItem({
      id: `sensorial-${match.slug}`,
      name: match.name,
      slug: match.slug,
      price: match.price,
      images: [match.image],
      category: "yerbas",
      status: "available",
      stock: 25,
      description: match.description,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setDrawer(true);
    }, 600);
  };

  const resetFilters = () => {
    setIntensity("medio");
    setDigestive("cero_acidez");
    setDrying("natural");
  };

  return (
    <section className="py-16 lg:py-24 bg-pava-cream relative overflow-hidden border-t border-pava-brown/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-pava-green/25 bg-pava-green/8 px-3.5 py-1 text-xs font-semibold text-pava-green mb-3">
            <Leaf size={13} className="text-pava-green" />
            <span>Asistente de Paladar</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-pava-brown tracking-tight">
            Buscador Sensorial de Yerbas
          </h2>
          <p className="mt-3 text-sm sm:text-base text-pava-brown-mid/80 leading-relaxed">
            Indicá tus preferencias de amargor, tolerancia digestiva y secado para encontrar la yerba hecha a tu medida.
          </p>
        </div>

        {/* Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Controls Column */}
          <div className="lg:col-span-7 rounded-3xl border border-pava-brown/12 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            {/* Filter 1: Intensity */}
            <div>
              <label className="font-display text-sm font-bold text-pava-brown flex items-center justify-between mb-2.5">
                <span className="flex items-center gap-2">
                  <Flame size={16} className="text-pava-terracotta" />
                  1. Intensidad de Amargor
                </span>
                <span className="text-xs text-pava-green font-semibold capitalize">
                  {intensity === "suave" ? "Suave y Dulce" : intensity === "medio" ? "Equilibrada" : "Fuerte & Robusta"}
                </span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "suave", label: "Suave", sub: "Bajo amargor" },
                  { id: "medio", label: "Equilibrada", sub: "Clásica argentina" },
                  { id: "intenso", label: "Intensa", sub: "Amarga persistente" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIntensity(item.id as "suave" | "medio" | "intenso")}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      intensity === item.id
                        ? "border-pava-green bg-pava-green/10 text-pava-green font-bold shadow-sm"
                        : "border-pava-brown/15 bg-pava-cream/30 text-pava-brown hover:border-pava-brown/30"
                    }`}
                  >
                    <span className="block text-xs font-bold">{item.label}</span>
                    <span className="block text-[10px] text-pava-brown-mid/70 mt-0.5">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 2: Digestive tolerance */}
            <div>
              <label className="font-display text-sm font-bold text-pava-brown flex items-center justify-between mb-2.5">
                <span className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-700" />
                  2. Tolerancia Digestiva & Acidez
                </span>
                <span className="text-xs text-pava-green font-semibold capitalize">
                  {digestive === "cero_acidez" ? "Cero Acidez" : digestive === "despalada" ? "Pura Hoja" : "Con Hierbas"}
                </span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "cero_acidez", label: "Cero Acidez", sub: "Bajo polvo / Apta reflujo" },
                  { id: "despalada", label: "Despalada", sub: "Pura hoja tipo uruguaya" },
                  { id: "compuesta", label: "Compuesta", sub: "Menta, boldo y hierbas" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDigestive(item.id as "cero_acidez" | "despalada" | "compuesta")}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      digestive === item.id
                        ? "border-pava-green bg-pava-green/10 text-pava-green font-bold shadow-sm"
                        : "border-pava-brown/15 bg-pava-cream/30 text-pava-brown hover:border-pava-brown/30"
                    }`}
                  >
                    <span className="block text-xs font-bold">{item.label}</span>
                    <span className="block text-[10px] text-pava-brown-mid/70 mt-0.5">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 3: Drying method */}
            <div>
              <label className="font-display text-sm font-bold text-pava-brown flex items-center justify-between mb-2.5">
                <span className="flex items-center gap-2">
                  <Sparkles size={16} className="text-pava-gold" />
                  3. Tipo de Secado & Estacionamiento
                </span>
                <span className="text-xs text-pava-green font-semibold capitalize">
                  {drying === "natural" ? "Natural 24 meses" : drying === "barbacua" ? "Ahumada Barbacuá" : "Estándar"}
                </span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "natural", label: "Estacionamiento 24m", sub: "Maduración natural" },
                  { id: "barbacua", label: "Barbacuá Ahumada", sub: "Secado a leña 24hs" },
                  { id: "estandar", label: "Secado Tradicional", sub: "12 meses estándar" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDrying(item.id as "estandar" | "natural" | "barbacua")}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      drying === item.id
                        ? "border-pava-green bg-pava-green/10 text-pava-green font-bold shadow-sm"
                        : "border-pava-brown/15 bg-pava-cream/30 text-pava-brown hover:border-pava-brown/30"
                    }`}
                  >
                    <span className="block text-xs font-bold">{item.label}</span>
                    <span className="block text-[10px] text-pava-brown-mid/70 mt-0.5">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs text-pava-brown-mid/60 hover:text-pava-brown transition-colors"
              >
                <RotateCcw size={12} />
                <span>Reiniciar preferencias</span>
              </button>
            </div>
          </div>

          {/* Result Match Column */}
          <div className="lg:col-span-5 rounded-3xl border border-pava-green/20 bg-pava-green text-pava-cream p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-pava-gold flex items-center gap-1">
                  <Sparkles size={12} /> 98% de Compatibilidad
                </span>
                <span className="bg-white/15 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white">
                  {match.brand}
                </span>
              </div>

              {/* Product Card Showcase */}
              <div className="rounded-2xl bg-white text-pava-brown p-5 shadow-lg mb-6">
                <div className="relative h-44 w-full rounded-xl overflow-hidden bg-pava-cream/60 border border-pava-brown/10 mb-4">
                  <Image
                    src={match.image}
                    alt={match.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 rounded-full bg-pava-green px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    {match.tagline}
                  </div>
                </div>

                <h3 className="font-display text-base font-bold text-pava-brown leading-snug">
                  {match.name}
                </h3>
                <p className="text-xs text-pava-brown-mid/80 mt-1.5 leading-relaxed line-clamp-3">
                  {match.description}
                </p>

                <div className="mt-4 pt-3 border-t border-pava-brown/10 flex items-center justify-between">
                  <div>
                    <span className="font-display text-xl font-bold text-pava-green block">
                      {formatPrice(match.price)}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-800">
                      {formatPrice(Math.round(match.price * 0.9))} c/ transferencia
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-pava-brown/60 flex items-center gap-1">
                    <Check size={14} className="text-pava-green" /> En Stock
                  </span>
                </div>
              </div>
            </div>

            {/* Action */}
            <button
              onClick={handleAddToCart}
              disabled={added}
              className={`w-full flex items-center justify-center gap-2 rounded-control py-3.5 px-6 text-sm font-bold tracking-wide transition-all shadow-lg active:scale-98 ${
                added
                  ? "bg-emerald-500 text-white"
                  : "bg-pava-gold text-pava-brown hover:bg-pava-gold-light"
              }`}
            >
              <ShoppingBag size={17} />
              <span>{added ? "¡Agregado al carrito!" : "Llevar mi yerba ideal"}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
