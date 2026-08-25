"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ShoppingBag, Sparkles, Zap, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types";

interface ComboPack {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  image: string;
  description: string;
  price: number;
  originalPrice: number;
  items: string[];
  mockProduct: Product;
}

const COMBO_PACKS: ComboPack[] = [
  {
    id: "combo-camionero-playadito",
    name: "Pack Matero Tradicional",
    badge: "🔥 Más Elegido",
    badgeColor: "bg-pava-terracotta text-white",
    image: "/products/mate-camionero.png",
    description:
      "El kit perfecto para el día a día. Mate de calabaza brasilera de boca ancha, bombilla pico de loro de alpaca y yerba suave sin acidez.",
    price: 44900,
    originalPrice: 52000,
    items: [
      "Mate Camionero de Calabaza seleccionada",
      "Bombilla Pico de Loro en Alpaca maciza",
      "Yerba Playadito Tradicional 500g",
    ],
    mockProduct: {
      id: "pack-tradicional",
      name: "Pack Matero Tradicional (Camionero + Bombilla Alpaca + Playadito)",
      slug: "pack-matero-tradicional",
      description: "Set completo listo para cebar.",
      price: 44900,
      category: "combos",
      status: "available",
      stock: 15,
      images: ["/products/mate-camionero.png"],
      brand: "Poné La Pava",
    },
  },
  {
    id: "combo-imperial-canarias",
    name: "Combo Rioplatense Premium",
    badge: "✨ Alta Gama",
    badgeColor: "bg-pava-gold text-pava-green-dark font-bold",
    image: "/products/mate-imperial-cincelado.png",
    description:
      "Máxima elegancia y durabilidad. Mate Imperial forrado en cuero vacuno con virola de alpaca cincelada y termo de acero inoxidable 1L.",
    price: 89900,
    originalPrice: 104500,
    items: [
      "Mate Imperial con Virola de Alpaca Cincelada",
      "Termo de Acero Inoxidable 1L con Pico Cebador",
      "Yerba Canarias Serena 1kg",
    ],
    mockProduct: {
      id: "pack-rioplatense",
      name: "Combo Rioplatense Premium (Imperial + Termo + Canarias 1kg)",
      slug: "combo-rioplatense-premium",
      description: "Combo matero de alta gama.",
      price: 89900,
      category: "combos",
      status: "available",
      stock: 8,
      images: ["/products/mate-imperial-cincelado.png"],
      brand: "Poné La Pava",
    },
  },
  {
    id: "combo-degustacion-yerbas",
    name: "Pack Degustación 3 Yerbas",
    badge: "🍃 Trío Seleccionado",
    badgeColor: "bg-pava-green text-white",
    image: "/products/yerba-canarias-1kg.png",
    description:
      "Explorá distintos perfiles de sabor: la suavidad correntina de Playadito, la intensidad uruguaya de Canarias y la nobleza de Sara.",
    price: 26900,
    originalPrice: 31500,
    items: [
      "Yerba Mate Playadito Tradicional 500g",
      "Yerba Mate Canarias Serena 1kg",
      "Yerba Mate Sara Roja Especial 1kg",
    ],
    mockProduct: {
      id: "pack-degustacion",
      name: "Pack Degustación 3 Yerbas (Playadito + Canarias + Sara)",
      slug: "pack-degustacion-yerbas",
      description: "Trío de yerbas de primer nivel.",
      price: 26900,
      category: "yerbas",
      status: "available",
      stock: 20,
      images: ["/products/yerba-canarias-1kg.png"],
      brand: "Selección Especial",
    },
  },
  {
    id: "combo-torpedo-sara",
    name: "Combo Torpedo Urbano",
    badge: "🧉 Clásico",
    badgeColor: "bg-[#4a3525] text-white",
    image: "/products/mate-torpedo.png",
    description:
      "Diseño estilizado y compacto, ideal para llevar en el auto o la mochila con la mejor yerba de molienda fina.",
    price: 49500,
    originalPrice: 58000,
    items: [
      "Mate Torpedo de Cuero Genuino",
      "Bombilla Cincelada Ranurada en Alpaca",
      "Yerba Mate Sara Roja 1kg",
    ],
    mockProduct: {
      id: "pack-torpedo",
      name: "Combo Torpedo Urbano (Torpedo + Bombilla + Sara 1kg)",
      slug: "combo-torpedo-urbano",
      description: "Combo torpedo con yerba y bombilla.",
      price: 49500,
      category: "combos",
      status: "available",
      stock: 12,
      images: ["/products/mate-torpedo.png"],
      brand: "Poné La Pava",
    },
  },
];

export default function ComboPacksSection() {
  const { addItem, setDrawer } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  function handleAddCombo(combo: ComboPack) {
    addItem(combo.mockProduct, 1);
    setAddedId(combo.id);
    setDrawer(true);
    setTimeout(() => setAddedId(null), 2000);
  }

  return (
    <section className="relative bg-pava-cream-light py-16 sm:py-20 lg:py-24 border-t border-pava-brown/10 overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-pava-gold/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 rounded-full bg-pava-green/5 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pava-green/10 text-pava-green text-xs font-bold tracking-wider uppercase mb-3">
            <Zap size={14} className="text-pava-gold" />
            Combos Listos & Ahorro
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-pava-brown tracking-tight">
            Packs Materos con <span className="text-pava-green italic">Descuento Especial</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-pava-brown-mid leading-relaxed font-sans">
            Conjuntos curados con los mejores mates, bombillas y yerbas para que ahorres y recibas tu set completo en un solo envío.
          </p>
        </div>

        {/* Grid of Packs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {COMBO_PACKS.map((pack) => {
            const savings = pack.originalPrice - pack.price;
            const savingsPct = Math.round((savings / pack.originalPrice) * 100);

            return (
              <div
                key={pack.id}
                className="group relative flex flex-col justify-between rounded-2xl bg-white border border-pava-brown/12 p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(38,64,46,0.15)] hover:border-pava-green/30 transition-all duration-300"
              >
                {/* Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide ${pack.badgeColor}`}
                  >
                    {pack.badge}
                  </span>
                  <span className="text-[11px] font-bold text-pava-green bg-pava-green/10 px-2 py-0.5 rounded-full">
                    Ahorrás {formatPrice(savings)} ({savingsPct}%)
                  </span>
                </div>

                {/* Product Image */}
                <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden bg-pava-cream/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                  <Image
                    src={pack.image}
                    alt={pack.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-contain p-4"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-bold text-lg text-pava-brown group-hover:text-pava-green transition-colors">
                      {pack.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-pava-brown-mid/80 line-clamp-2">
                      {pack.description}
                    </p>

                    {/* Includes List */}
                    <div className="mt-4 pt-3 border-t border-pava-brown/8 space-y-1.5">
                      <span className="text-[11px] font-bold text-pava-brown-mid uppercase tracking-wider block">
                        Incluye:
                      </span>
                      {pack.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-xs text-pava-brown"
                        >
                          <Check
                            size={14}
                            className="text-pava-green shrink-0 mt-0.5"
                          />
                          <span className="leading-tight">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="mt-6 pt-4 border-t border-pava-brown/10">
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="font-display text-2xl font-extrabold text-pava-brown">
                        {formatPrice(pack.price)}
                      </span>
                      <span className="text-xs text-pava-brown-mid/60 line-through">
                        {formatPrice(pack.originalPrice)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddCombo(pack)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-pava-green hover:bg-pava-green-light text-pava-cream font-bold text-xs shadow-md hover:shadow-lg transition-all duration-200 active:scale-98"
                    >
                      <ShoppingBag size={15} />
                      <span>{addedId === pack.id ? "¡Agregado!" : "Agregar Combo"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
