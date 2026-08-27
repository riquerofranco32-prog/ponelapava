"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Droplets,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

export default function YerbaYieldCalculator() {
  const [termosPerDay, setTermosPerDay] = useState(2);
  const [drinkersCount, setDrinkersCount] = useState(1);
  const [mateSize, setMateSize] = useState<"standard" | "large" | "terere">("standard");
  const { addItem, setDrawer } = useCart();
  const [added, setAdded] = useState(false);

  // Grams per mate reload based on mate size
  const GRAMS_PER_MATE = {
    standard: 40,
    large: 60,
    terere: 50,
  }[mateSize];

  // Number of mates/refills per day based on thermos and drinkers
  // Typically 1 refill every 1-1.5 thermos
  const refillsPerDay = Math.max(1, Math.round(termosPerDay * 0.85 * (drinkersCount > 1 ? 1.4 : 1)));
  const gramsPerDay = refillsPerDay * GRAMS_PER_MATE;
  const monthlyKg = ((gramsPerDay * 30) / 1000).toFixed(1);
  const monthlyLiters = termosPerDay * 30;
  const avgCostPerKg = 4800; // Average price per kg of selected yerbas
  const monthlyCost = Math.round(parseFloat(monthlyKg) * avgCostPerKg);
  const costPerTermo = Math.round((monthlyCost / monthlyLiters) || 120);

  // Determine suggested pack based on consumption
  const getSuggestedPack = () => {
    const kg = parseFloat(monthlyKg);
    if (kg <= 1.2) {
      return {
        id: "yerba-amanda-500g",
        name: "Pack Dúo Yerba Tradicional 1kg (2x 500g)",
        slug: "yerba-amanda-500g",
        price: 5200,
        image: "/product_yerba_amanda_1786546104213.png",
        description: "Ideal para consumo individual moderado. Sabor equilibrado y bajo polvo.",
      };
    } else if (kg <= 2.5) {
      return {
        id: "pack-mensual-2kg",
        name: "Pack Matero Mensual 2kg (2x 1kg)",
        slug: "combo-matero-completo-patagonico",
        price: 9800,
        image: "/product_combo_kit_1786546132809.png",
        description: "El formato más elegido por los materos diarios. Ahorro y frescura asegurada.",
      };
    } else {
      return {
        id: "pack-matero-familiar-4kg",
        name: "Combo Familiar & Oficina 4kg (4x 1kg)",
        slug: "combo-matero-completo-patagonico",
        price: 18500,
        image: "/product_combo_kit_1786546132809.png",
        description: "Para rondas compartidas y hogares con alto consumo. Máximo rendimiento.",
      };
    }
  };

  const pack = getSuggestedPack();

  const handleAddPack = () => {
    addItem({
      id: pack.id,
      name: pack.name,
      slug: pack.slug,
      price: pack.price,
      images: [pack.image],
      category: "yerbas",
      status: "available",
      stock: 20,
      description: pack.description,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setDrawer(true);
    }, 600);
  };

  return (
    <section
      id="calculadora-cebador"
      className="relative overflow-hidden py-16 lg:py-24 bg-pava-cream border-t border-b border-pava-brown/10"
    >
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 -left-48 h-96 w-96 rounded-full bg-pava-green/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-48 h-96 w-96 rounded-full bg-pava-gold/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-pava-green/25 bg-pava-green/8 px-3.5 py-1 text-xs font-semibold text-pava-green mb-3">
            <Sparkles size={13} className="text-pava-green" />
            <span>Herramienta Interactiva</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-pava-brown tracking-tight">
            Calculadora del Cebador
          </h2>
          <p className="mt-3 text-sm sm:text-base text-pava-brown-mid/80 leading-relaxed">
            Descubrí cuántos litros de mate tomás al mes, cuánto te rinde tu yerba y cuál es tu pack de ahorro ideal.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Controls Column */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-3xl border border-pava-brown/12 bg-white/90 p-6 sm:p-8 shadow-sm backdrop-blur-sm">
            <div className="space-y-6">
              {/* Question 1: Termos per day */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-display text-sm font-bold text-pava-brown flex items-center gap-2">
                    <Droplets size={16} className="text-pava-green" />
                    ¿Cuántos termos tomás al día?
                  </label>
                  <span className="font-display text-base font-bold text-pava-green">
                    {termosPerDay} {termosPerDay === 1 ? "termo" : "termos"} ({(termosPerDay * 1).toFixed(0)}L)
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={termosPerDay}
                  onChange={(e) => setTermosPerDay(parseInt(e.target.value, 10))}
                  aria-label="Cantidad de termos por día"
                  className="w-full h-2 bg-pava-brown/15 rounded-lg appearance-none cursor-pointer accent-pava-green"
                />
                <div className="flex justify-between text-[11px] text-pava-brown-mid/60 mt-1">
                  <span>1 termo (1L)</span>
                  <span>2 termos</span>
                  <span>3 termos</span>
                  <span>4+ termos</span>
                </div>
              </div>

              {/* Question 2: Drinkers count */}
              <div>
                <label className="font-display text-sm font-bold text-pava-brown block mb-2.5">
                  ¿Quiénes toman mate?
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { count: 1, label: "Solo yo", emoji: "👤" },
                    { count: 2, label: "En pareja", emoji: "👥" },
                    { count: 4, label: "Familia / Oficina", emoji: "🏢" },
                  ].map((item) => (
                    <button
                      key={item.count}
                      type="button"
                      onClick={() => setDrinkersCount(item.count)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all ${
                        drinkersCount === item.count
                          ? "border-pava-green bg-pava-green/10 text-pava-green font-bold shadow-sm"
                          : "border-pava-brown/15 bg-pava-cream/30 text-pava-brown hover:border-pava-brown/30"
                      }`}
                    >
                      <span className="text-lg mb-1">{item.emoji}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Mate Size */}
              <div>
                <label className="font-display text-sm font-bold text-pava-brown block mb-2.5">
                  Tamaño de tu mate
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "standard", label: "Mediano (40g)", sub: "Calabaza / Madera" },
                    { id: "large", label: "Imperial (60g)", sub: "Boca ancha / Premium" },
                    { id: "terere", label: "Vaso Térmico (50g)", sub: "Acero / Tereré" },
                  ].map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setMateSize(size.id as "standard" | "large" | "terere")}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        mateSize === size.id
                          ? "border-pava-green bg-pava-green/10 text-pava-green shadow-sm"
                          : "border-pava-brown/15 bg-pava-cream/30 text-pava-brown hover:border-pava-brown/30"
                      }`}
                    >
                      <span className="block text-xs font-bold">{size.label}</span>
                      <span className="block text-[10px] text-pava-brown-mid/70 mt-0.5">{size.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Summary Bar */}
            <div className="mt-8 pt-5 border-t border-pava-brown/10 flex items-center justify-between text-xs text-pava-brown-mid/80">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-pava-green" /> Basado en hábito diario constante
              </span>
              <span className="font-semibold text-pava-brown">30 días de cálculo</span>
            </div>
          </div>

          {/* Results & Recommendation Column */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-3xl border border-pava-green/20 bg-pava-green text-pava-cream p-6 sm:p-8 shadow-xl">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-pava-gold">
                Tu Diagnóstico Matero
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1 mb-6">
                Rendimiento Mensual Estimado
              </h3>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-pava-cream/70 block">
                    Consumo Yerba
                  </span>
                  <span className="font-display text-xl sm:text-2xl font-bold text-pava-gold mt-1 block">
                    {monthlyKg} kg
                  </span>
                  <span className="text-[10px] text-pava-cream/60">por mes</span>
                </div>

                <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-pava-cream/70 block">
                    Litros de Mate
                  </span>
                  <span className="font-display text-xl sm:text-2xl font-bold text-white mt-1 block">
                    {monthlyLiters} L
                  </span>
                  <span className="text-[10px] text-pava-cream/60">cebados</span>
                </div>

                <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-pava-cream/70 block">
                    Costo x Termo
                  </span>
                  <span className="font-display text-xl sm:text-2xl font-bold text-emerald-300 mt-1 block">
                    ${costPerTermo}
                  </span>
                  <span className="text-[10px] text-pava-cream/60">super rendidor</span>
                </div>
              </div>

              {/* Suggested Product Card */}
              <div className="rounded-2xl bg-white/95 text-pava-brown p-4 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-bold text-pava-green uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={12} /> Pack Ahorro Recomendado
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    10% OFF c/ Transferencia
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-pava-cream/60 border border-pava-brown/10">
                    <Image
                      src={pack.image}
                      alt={pack.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm font-bold text-pava-brown line-clamp-1">
                      {pack.name}
                    </h4>
                    <p className="text-xs text-pava-brown-mid/70 line-clamp-1 mt-0.5">
                      {pack.description}
                    </p>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="font-display text-base font-bold text-pava-green">
                        {formatPrice(pack.price)}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700">
                        {formatPrice(Math.round(pack.price * 0.9))} c/ transf.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleAddPack}
                disabled={added}
                className={`w-full flex items-center justify-center gap-2 rounded-control py-3.5 px-6 text-sm font-bold tracking-wide transition-all shadow-lg active:scale-[0.98] ${
                  added
                    ? "bg-emerald-500 text-white"
                    : "bg-pava-gold text-pava-brown hover:bg-pava-gold-light"
                }`}
              >
                <ShoppingBag size={17} />
                <span>{added ? "¡Agregado al carrito!" : "Llevar mi pack mensual sugerido"}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
