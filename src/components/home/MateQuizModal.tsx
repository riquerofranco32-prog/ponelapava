"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  X,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface QuestionOption {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

interface Question {
  id: number;
  title: string;
  subtitle: string;
  options: QuestionOption[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    title: "¿Dónde y cómo solés tomar mate?",
    subtitle: "Contanos tu rutina para recomendarte el mejor compañero",
    options: [
      {
        id: "daily-home",
        emoji: "🛋️",
        title: "En casa o trabajo tranquilo",
        description: "Me tomo mi tiempo, me gusta el ritual tradicional y el mate espumoso.",
      },
      {
        id: "on-the-go",
        emoji: "🚗",
        title: "En movimiento / Viajes / Facu",
        description: "Necesito practicidad, que aguante golpes y sea fácil de vaciar y limpiar.",
      },
      {
        id: "social-share",
        emoji: "👥",
        title: "Rondas con amigos y familia",
        description: "Mates largos, buena capacidad para que no se lave rápido.",
      },
    ],
  },
  {
    id: 2,
    title: "¿Qué perfil de sabor preferís?",
    subtitle: "Cada paladar tiene su yerba y tamaño de mate ideal",
    options: [
      {
        id: "smooth",
        emoji: "🍃",
        title: "Suave, bajo en polvo y sin acidez",
        description: "Buscás cebadas livianas y mates medianos para yerba compuesta o suave.",
      },
      {
        id: "intense",
        emoji: "⚡",
        title: "Intenso, amargo y con cuerpo",
        description: "Yerba tipo uruguaya o barbacuá con buena montañita y mate torpedo.",
      },
      {
        id: "herbal",
        emoji: "🌿",
        title: "Aromático con hierbas o tereré",
        description: "Con poleo, menta, cedrón o para disfrutar bien frío en verano.",
      },
    ],
  },
  {
    id: 3,
    title: "¿Qué estilo de mate va con tu personalidad?",
    subtitle: "El toque final para tu kit matero",
    options: [
      {
        id: "imperial",
        emoji: "👑",
        title: "Imperial Premium",
        description: "Cuero vacuno legítimo, virola de alpaca cincelada y presencia imponente.",
      },
      {
        id: "wood",
        emoji: "🪵",
        title: "Algarrobo / Madera noble",
        description: "Calidez natural, aroma a madera y estilo rústico auténtico.",
      },
      {
        id: "thermal",
        emoji: "🛡️",
        title: "Acero Térmico Doble Pared",
        description: "Cero mantenimiento, no necesita curado e higiénico.",
      },
    ],
  },
];

interface Recommendation {
  matchRate: number;
  title: string;
  subtitle: string;
  productName: string;
  productSlug: string;
  productImage: string;
  price: number;
  description: string;
  tip: string;
}

export default function MateQuizModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [calculating, setCalculating] = useState(false);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (!isOpen) return null;

  const handleSelectOption = (optionId: string) => {
    const nextAnswers = { ...answers, [currentStep]: optionId };
    setAnswers(nextAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      // Calculate result
      setCalculating(true);
      setTimeout(() => {
        // Compute recommendation based on answers
        const q3 = nextAnswers[2];
        const q2 = nextAnswers[1];

        let result: Recommendation;

        if (q3 === "imperial") {
          result = {
            matchRate: 98,
            title: "¡Tu perfil es Matero Tradicional Premium!",
            subtitle: "Buscás distinción, sabor auténtico y el ritual en su máxima expresión.",
            productName: "Mate Imperial Torpedo Cuero & Alpaca",
            productSlug: "mate-imperial-torpedo-cuero",
            productImage: "/product_mate_calabaza_1786546121145.png",
            price: 28500,
            description: "Confeccionado en calabaza brasileña seleccionada de paredes gruesas, forrado en cuero vacuno y virola de alpaca labrada.",
            tip: "Curá tu calabaza con yerba usada 24hs antes del primer uso para sellar los poros.",
          };
        } else if (q3 === "wood" || q2 === "smooth") {
          result = {
            matchRate: 96,
            title: "¡Tu perfil es Matero Artesanal & Cálido!",
            subtitle: "Apreciás los aromas nobles de la madera y las cebadas balanceadas.",
            productName: "Combo Matero Completo Patagónico",
            productSlug: "combo-matero-completo-patagonico",
            productImage: "/product_combo_kit_1786546132809.png",
            price: 49900,
            description: "Kit completo que incluye mate artesanal de madera, bombilla pico de loro de alpaca y yerbera de cuero.",
            tip: "Untá el interior con manteca o aceite neutro antes del primer uso para hidratar la madera.",
          };
        } else {
          result = {
            matchRate: 95,
            title: "¡Tu perfil es Matero Práctico & Dinámico!",
            subtitle: "Priorizás la durabilidad, fácil lavado y la temperatura constante.",
            productName: "Set Matero Térmico Acero Inoxidable",
            productSlug: "termo-stanley-classic-14l",
            productImage: "/category_termos_1786546003986.png",
            price: 36000,
            description: "Acero inoxidable 304 doble pared al vacío. Mantiene la temperatura perfecta sin alterar el sabor de la yerba.",
            tip: "No precisa curado, está listo para estrenar apenas lo recibís.",
          };
        }

        setRecommendation(result);
        setCalculating(false);
      }, 700);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({});
    setRecommendation(null);
    setAdded(false);
  };

  const handleQuickAdd = () => {
    if (!recommendation) return;
    addItem({
      id: recommendation.productSlug,
      name: recommendation.productName,
      slug: recommendation.productSlug,
      price: recommendation.price,
      images: [recommendation.productImage],
      category: "mates",
      status: "available",
      stock: 10,
      description: recommendation.description,
    });
    setAdded(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-pava-brown/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-pava-brown/15 bg-pava-cream shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pava-brown/10 bg-white/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pava-green text-white text-xs">
              <Sparkles size={14} />
            </span>
            <div>
              <h3 className="font-display text-sm font-bold text-pava-brown">
                Test Matero Poné La Pava
              </h3>
              <p className="text-[10px] text-pava-brown-mid/70">
                Encontrá tu compañero ideal en 3 pasos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-pava-brown/50 transition-colors hover:bg-pava-brown/10 hover:text-pava-brown"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        {!recommendation && !calculating && (
          <div className="h-1.5 w-full bg-pava-brown/10">
            <div
              className="h-full bg-pava-green transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / QUESTIONS.length) * 100}%`,
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-8">
          {calculating ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pava-green/10 text-3xl animate-bounce">
                🧉
              </div>
              <h4 className="font-display text-lg font-bold text-pava-brown">
                Preparando tu recomendación...
              </h4>
              <p className="mt-1 text-xs text-pava-brown-mid/70">
                Analizando combinaciones de yerbas, virolas y materiales
              </p>
            </div>
          ) : recommendation ? (
            /* Result view */
            <div className="space-y-5">
              <div className="text-center">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  <CheckCircle2 size={13} /> {recommendation.matchRate}% de compatibilidad
                </span>
                <h4 className="font-display text-xl font-bold text-pava-brown mt-2">
                  {recommendation.title}
                </h4>
                <p className="text-xs text-pava-brown-mid/80 mt-1">
                  {recommendation.subtitle}
                </p>
              </div>

              {/* Product preview card */}
              <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-pava-brown/15 bg-white p-4 shadow-sm">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-pava-cream/60">
                  <Image
                    src={recommendation.productImage}
                    alt={recommendation.productName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pava-green">
                    Recomendación Principal
                  </span>
                  <h5 className="font-display text-base font-bold text-pava-brown">
                    {recommendation.productName}
                  </h5>
                  <p className="text-xs text-pava-brown-mid/75 line-clamp-2 mt-1">
                    {recommendation.description}
                  </p>
                  <div className="mt-2.5 flex items-baseline justify-center sm:justify-start gap-2">
                    <span className="font-display text-lg font-bold text-pava-green">
                      {formatPrice(recommendation.price)}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {formatPrice(Math.round(recommendation.price * 0.9))} c/ Transferencia
                    </span>
                  </div>
                </div>
              </div>

              {/* Tip callout */}
              <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-900">
                <span className="text-sm">💡</span>
                <p>
                  <strong>Tip matero:</strong> {recommendation.tip}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={handleQuickAdd}
                  disabled={added}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-control py-3 text-xs font-bold tracking-wide transition-all ${
                    added
                      ? "bg-emerald-600 text-white"
                      : "bg-pava-green text-pava-cream hover:bg-pava-green-light"
                  }`}
                >
                  <ShoppingBag size={15} />
                  {added ? "¡Agregado al carrito!" : "Agregar al carrito"}
                </button>

                <Link
                  href={`/producto/${recommendation.productSlug}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 rounded-control border border-pava-brown/20 bg-white px-4 py-3 text-xs font-bold text-pava-brown hover:bg-pava-cream transition-colors"
                >
                  <span>Ver detalles</span>
                  <ExternalLink size={13} />
                </Link>
              </div>

              <div className="text-center pt-1">
                <button
                  onClick={handleRestart}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-pava-brown/60 hover:text-pava-brown transition-colors"
                >
                  <RotateCcw size={12} />
                  Hacer el test de nuevo
                </button>
              </div>
            </div>
          ) : (
            /* Questions view */
            <div>
              <div className="mb-5">
                <div className="flex items-center justify-between text-[11px] font-bold text-pava-green uppercase tracking-wider mb-1">
                  <span>Paso {currentStep + 1} de {QUESTIONS.length}</span>
                </div>
                <h4 className="font-display text-lg font-bold text-pava-brown">
                  {QUESTIONS[currentStep].title}
                </h4>
                <p className="text-xs text-pava-brown-mid/70 mt-0.5">
                  {QUESTIONS[currentStep].subtitle}
                </p>
              </div>

              <div className="space-y-3">
                {QUESTIONS[currentStep].options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className="w-full text-left rounded-2xl border border-pava-brown/12 bg-white p-4 transition-all duration-200 hover:border-pava-green hover:bg-pava-cream/40 hover:shadow-md active:scale-[0.99] group"
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pava-cream text-xl transition-transform group-hover:scale-110">
                        {opt.emoji}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-display text-sm font-bold text-pava-brown group-hover:text-pava-green transition-colors">
                            {opt.title}
                          </span>
                          <ArrowRight
                            size={15}
                            className="text-pava-brown/30 group-hover:text-pava-green group-hover:translate-x-1 transition-all"
                          />
                        </div>
                        <p className="text-xs text-pava-brown-mid/70 mt-1 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
