"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, ShoppingBag, CheckCircle, Info, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types";

interface YerbaProfile {
  id: string;
  name: string;
  badge: string;
  icon: string;
  tagline: string;
  description: string;
  idealFor: string;
  metrics: {
    intensity: number; // 1-5
    dust: number; // 1-5
    durability: number; // 1-5
    bitterness: number; // 1-5
  };
  featuredProduct: {
    name: string;
    brand: string;
    weight: string;
    price: number;
    image: string;
    product: Product;
  };
}

const YERBA_PROFILES: YerbaProfile[] = [
  {
    id: "suave",
    name: "Suave & Equilibrada",
    badge: "0% Acidez",
    icon: "🍃",
    tagline: "Secado natural, hojas seleccionadas y bajo polvo",
    description:
      "La opción predilecta para cebar todo el día sin sentir pesadez estomacal ni acidez. Hojas estacionadas durante más de 12 meses que aportan notas dulces y herbales muy amigables.",
    idealFor: "Estómagos sensibles, jornadas de estudio/trabajo o quienes se inician en el mate.",
    metrics: {
      intensity: 2,
      dust: 1,
      durability: 3,
      bitterness: 2,
    },
    featuredProduct: {
      name: "Yerba Mate Playadito Tradicional",
      brand: "Playadito",
      weight: "500g / 1kg",
      price: 4900,
      image: "/products/yerba-playadito-500g.png",
      product: {
        id: "yerba-playadito-500g",
        name: "Yerba Mate Playadito 500g",
        slug: "yerba-mate-playadito-500g",
        description: "Yerba suave y seleccionada.",
        price: 4900,
        category: "yerbas",
        status: "available",
        stock: 50,
        images: ["/products/yerba-playadito-500g.png"],
        brand: "Playadito",
      },
    },
  },
  {
    id: "intensa",
    name: "Intensa & Molienda PU1",
    badge: "Estilo Uruguayo",
    icon: "⚡",
    tagline: "Despalada, hoja pura picada fina y espuma persistente",
    description:
      "Cuerpo robusto y sabor concentrado. Al no contener palo, rinde hasta un 50% más de agua por cebada sin lavarse. Genera una capa de espuma densa y cremosa que sostiene el sabor por horas.",
    idealFor: "Materos experimentados que buscan intensidad, cuerpo y máxima duración de la cebada.",
    metrics: {
      intensity: 5,
      dust: 4,
      durability: 5,
      bitterness: 5,
    },
    featuredProduct: {
      name: "Yerba Mate Canarias Tradicional",
      brand: "Canarias",
      weight: "1kg",
      price: 8900,
      image: "/products/yerba-canarias-1kg.png",
      product: {
        id: "yerba-canarias-1kg",
        name: "Yerba Mate Canarias Tradicional 1kg",
        slug: "yerba-mate-canarias-1kg",
        description: "Yerba uruguaya pura hoja.",
        price: 8900,
        category: "yerbas",
        status: "available",
        stock: 45,
        images: ["/products/yerba-canarias-1kg.png"],
        brand: "Canarias",
      },
    },
  },
  {
    id: "compuesta",
    name: "Compuesta & Digestiva",
    badge: "Hierbas Serranas",
    icon: "🌿",
    tagline: "Blend natural con poleo, menta, cedrón y manzanilla",
    description:
      "Frescura inmediata en el paladar. La combinación de yerba mate con hierbas medicinales de montaña calma la digestión y aporta un toque mentolado y aromático único.",
    idealFor: "Tardes calurosas, momentos de sobremesa digestiva y amantes de los aromas herbales.",
    metrics: {
      intensity: 3,
      dust: 2,
      durability: 4,
      bitterness: 2,
    },
    featuredProduct: {
      name: "Yerba Mate Canarias Serena",
      brand: "Canarias",
      weight: "1kg",
      price: 9400,
      image: "/products/yerba-canarias-1kg.png",
      product: {
        id: "yerba-canarias-serena-1kg",
        name: "Yerba Mate Canarias Serena 1kg",
        slug: "yerba-mate-canarias-serena-1kg",
        description: "Blend suave con hierbas naturales.",
        price: 9400,
        category: "yerbas",
        status: "available",
        stock: 30,
        images: ["/products/yerba-canarias-1kg.png"],
        brand: "Canarias",
      },
    },
  },
  {
    id: "barbacua",
    name: "Ahumada Barbacuá",
    badge: "Secado Artesanal",
    icon: "🔥",
    tagline: "Secado tradicional a leña por 24 horas continuas",
    description:
      "Elaboración ancestral de los colonos misioneros. El humo de maderas nobles impregna las hojas, otorgando notas a roble, tabaco suave y un carácter inconfundible de campo.",
    idealFor: "Días fríos, fogones, amantes de sabores ahumados y café espresso oscuro.",
    metrics: {
      intensity: 4,
      dust: 2,
      durability: 4,
      bitterness: 4,
    },
    featuredProduct: {
      name: "Yerba Mate Sara Roja Especial",
      brand: "Sara",
      weight: "1kg",
      price: 8500,
      image: "/products/yerba-sara-1kg.png",
      product: {
        id: "yerba-sara-1kg",
        name: "Yerba Mate Sara Roja Especial 1kg",
        slug: "yerba-mate-sara-roja-1kg",
        description: "Yerba de molienda tradicional con carácter.",
        price: 8500,
        category: "yerbas",
        status: "available",
        stock: 25,
        images: ["/products/yerba-sara-1kg.png"],
        brand: "Sara",
      },
    },
  },
];

export default function YerbaProfileSelector({ embedded = false }: { embedded?: boolean }) {
  const [selectedId, setSelectedId] = useState("suave");
  const { addItem, setDrawer } = useCart();
  const [added, setAdded] = useState(false);

  const current = YERBA_PROFILES.find((p) => p.id === selectedId) ?? YERBA_PROFILES[0];

  function handleAddToCart() {
    addItem(current.featuredProduct.product, 1);
    setAdded(true);
    setDrawer(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function renderMetricBar(value: number, max = 5) {
    return (
      <div className="flex gap-1 items-center">
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={i}
            className={`h-2 w-5 rounded-full transition-all duration-300 ${
              i < value ? "bg-pava-green" : "bg-pava-brown/15"
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`mx-auto max-w-5xl rounded-3xl bg-white border border-pava-brown/12 p-6 sm:p-8 lg:p-10 shadow-lg ${
        embedded ? "" : "my-12"
      }`}
    >
      {/* Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
        {YERBA_PROFILES.map((profile) => {
          const isSelected = profile.id === selectedId;
          return (
            <button
              key={profile.id}
              type="button"
              onClick={() => setSelectedId(profile.id)}
              className={`flex flex-col items-center text-center p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-pava-green text-white border-pava-green shadow-md scale-[1.02]"
                  : "bg-pava-cream/60 hover:bg-pava-cream border-pava-brown/10 text-pava-brown"
              }`}
            >
              <span className="text-2xl mb-1">{profile.icon}</span>
              <span className="font-bold text-xs sm:text-sm leading-tight">
                {profile.name}
              </span>
              <span
                className={`text-[10px] mt-1 font-semibold uppercase tracking-wider ${
                  isSelected ? "text-pava-gold" : "text-pava-brown-mid/60"
                }`}
              >
                {profile.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
        {/* Left column: Sensory info & metrics */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{current.icon}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-pava-green">
                Perfil de Sabor
              </span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-pava-brown">
              {current.name}
            </h3>
            <p className="text-xs sm:text-sm text-pava-gold-deep font-semibold mt-1">
              {current.tagline}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-pava-brown-mid leading-relaxed font-sans">
            {current.description}
          </p>

          {/* Ideal For Box */}
          <div className="p-3.5 rounded-xl bg-pava-cream border border-pava-brown/10 flex items-start gap-2.5">
            <CheckCircle size={16} className="text-pava-green shrink-0 mt-0.5" />
            <div className="text-xs text-pava-brown">
              <strong>Recomendada para:</strong> {current.idealFor}
            </div>
          </div>

          {/* Metrics Radar / Bars */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-pava-brown/10">
            <div>
              <div className="text-[11px] font-bold text-pava-brown-mid mb-1">
                Intensidad de Sabor
              </div>
              {renderMetricBar(current.metrics.intensity)}
            </div>
            <div>
              <div className="text-[11px] font-bold text-pava-brown-mid mb-1">
                Presencia de Polvo
              </div>
              {renderMetricBar(current.metrics.dust)}
            </div>
            <div>
              <div className="text-[11px] font-bold text-pava-brown-mid mb-1">
                Rendimiento / Durabilidad
              </div>
              {renderMetricBar(current.metrics.durability)}
            </div>
            <div>
              <div className="text-[11px] font-bold text-pava-brown-mid mb-1">
                Nivel de Amargor
              </div>
              {renderMetricBar(current.metrics.bitterness)}
            </div>
          </div>
        </div>

        {/* Right column: Featured product packshot & direct add */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between p-6 rounded-2xl bg-pava-cream/50 border border-pava-brown/12">
          <span className="text-[11px] font-bold uppercase tracking-wider text-pava-green mb-2">
            Yerba Destacada de este perfil
          </span>

          <div className="relative w-44 h-48 my-2">
            <Image
              src={current.featuredProduct.image}
              alt={current.featuredProduct.name}
              fill
              sizes="180px"
              className="object-contain drop-shadow-md"
            />
          </div>

          <div className="text-center w-full mt-2">
            <h4 className="font-display font-bold text-base text-pava-brown">
              {current.featuredProduct.name}
            </h4>
            <div className="text-xs text-pava-brown-mid mt-0.5">
              Marca: <strong>{current.featuredProduct.brand}</strong> • {current.featuredProduct.weight}
            </div>
            <div className="font-display text-xl font-bold text-pava-green mt-2 mb-4">
              {formatPrice(current.featuredProduct.price)}
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-pava-green hover:bg-pava-green-light text-white font-bold text-xs shadow-md transition-transform active:scale-98 cursor-pointer"
            >
              <ShoppingBag size={15} />
              <span>{added ? "¡Agregada al Carrito!" : "Comprar Esta Yerba"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
