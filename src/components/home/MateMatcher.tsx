"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const ANSWER_MAP = {
  recien_arranco: { slug: "mates", tag: "iniciacion", title: "Mates fáciles de curar y kits de inicio" },
  todos_los_dias: { slug: "mates", tag: "diario", title: "Mates camioneros, imperiales y de alto rendimiento" },
  amargo: { slug: "yerbas", tag: "amargas", title: "Yerbas estacionadas intensas y tradicionales" },
  saborizada: { slug: "yerbas", tag: "saborizadas", title: "Yerbas compuestas con hierbas y cítricos" },
  en_casa: { slug: "combos", tag: "hogar", title: "Sets completos para tu rincón matero" },
  para_llevar: { slug: "termos", tag: "portatil", title: "Termos de alta conservación y portamates" },
} as const;

type AnswerKey = keyof typeof ANSWER_MAP;

interface QuestionConfig {
  question: string;
  subtitle: string;
  options: {
    label: string;
    desc: string;
    icon: string;
    key: AnswerKey;
  }[];
}

const QUESTIONS: QuestionConfig[] = [
  {
    question: "¿Cuál es tu nivel de experiencia?",
    subtitle: "Elegí la opción que mejor te represente",
    options: [
      {
        label: "Recién arranco",
        desc: "Busco algo noble, práctico y fácil de mantener",
        icon: "🌱",
        key: "recien_arranco",
      },
      {
        label: "Matero de todos los días",
        desc: "Tomo religiosamente varias rondas al día",
        icon: "🧉",
        key: "todos_los_dias",
      },
    ],
  },
  {
    question: "¿Qué sabor preferís en tu mate?",
    subtitle: "El perfil de yerba ideal para tu paladar",
    options: [
      {
        label: "Amargo tradicional",
        desc: "Cuerpo balanceado, molienda criolla y sabor duradero",
        icon: "🌿",
        key: "amargo",
      },
      {
        label: "Con hierbas o saborizada",
        desc: "Toques serranos, cítricos, menta o frutos del bosque",
        icon: "🍊",
        key: "saborizada",
      },
    ],
  },
  {
    question: "¿Dónde cebás con más frecuencia?",
    subtitle: "El momento donde más acompaña tu mate",
    options: [
      {
        label: "En casa o la oficina",
        desc: "Rondas tranquilas sobre el escritorio o la mesa",
        icon: "🏡",
        key: "en_casa",
      },
      {
        label: "Para salir y viajar",
        desc: "En el auto, la plaza, la facultad o el campo",
        icon: "🚗",
        key: "para_llevar",
      },
    ],
  },
];

export default function MateMatcher() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerKey[]>([]);

  const isDone = step >= QUESTIONS.length;
  const lastAnswer = isDone ? answers[answers.length - 1] : null;
  const result = lastAnswer ? ANSWER_MAP[lastAnswer] : null;
  const query = result
    ? `/catalogo?cat=${result.slug}&q=${answers
        .map((a) => ANSWER_MAP[a].tag)
        .join(" ")}`
    : "";

  function selectAnswer(key: AnswerKey) {
    setAnswers((prev) => [...prev, key]);
    setStep((prev) => prev + 1);
  }

  function goBack() {
    setAnswers((prev) => prev.slice(0, -1));
    setStep((prev) => Math.max(0, prev - 1));
  }

  function restart() {
    setAnswers([]);
    setStep(0);
  }

  return (
    <section className="bg-pava-cream py-24 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8 lg:px-10">
        <ScrollReveal direction="up" className="mb-10 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-9 bg-pava-gold-deep" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-gold-deep">
              Quiz interactivo
            </span>
            <span className="h-px w-9 bg-pava-gold-deep" />
          </div>
          <h2 className="font-display text-4xl font-bold leading-[0.93] tracking-tight text-pava-brown sm:text-5xl">
            ¿Qué mate va{" "}
            <em className="not-italic text-pava-terracotta">con vos?</em>
          </h2>
          <p className="mt-4 text-sm text-pava-brown-mid/70">
            Respondé 3 preguntas rápidas y descubrí la combinación perfecta para tu ronda.
          </p>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={100}>
          <div className="relative overflow-hidden rounded-card border border-pava-brown/15 bg-white p-6 shadow-sm sm:p-10">
            {/* Progress dots & bar */}
            <div className="mb-8 flex items-center justify-between border-b border-pava-brown/10 pb-5">
              <div className="flex items-center gap-2">
                {QUESTIONS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      step === i
                        ? "w-8 bg-pava-green"
                        : step > i
                          ? "w-2 bg-pava-gold"
                          : "w-2 bg-pava-brown/15"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-pava-gold-deep">
                {isDone ? "¡Listo!" : `Paso ${step + 1} de ${QUESTIONS.length}`}
              </span>
            </div>

            {/* Sliding panes */}
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${Math.min(step, QUESTIONS.length) * 100}%)`,
              }}
            >
              {QUESTIONS.map((q, i) => (
                <div
                  key={q.question}
                  className="w-full shrink-0 text-center"
                  aria-hidden={step !== i}
                  inert={step !== i}
                >
                  <h3 className="font-display text-2xl font-bold text-pava-brown sm:text-3xl">
                    {q.question}
                  </h3>
                  <p className="mb-8 mt-2 text-xs text-pava-brown-mid/70 sm:text-sm">
                    {q.subtitle}
                  </p>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => selectAnswer(opt.key)}
                        className="group flex flex-col items-center rounded-control border-2 border-pava-brown/15 bg-white p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-pava-green hover:bg-pava-cream-dark/50 active:scale-[0.98]"
                      >
                        <span className="mb-3 text-3xl transition-transform duration-200 group-hover:scale-110">
                          {opt.icon}
                        </span>
                        <span className="font-display text-base font-bold text-pava-brown group-hover:text-pava-green">
                          {opt.label}
                        </span>
                        <span className="mt-1 text-xs text-pava-brown-mid/70">
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Result pane */}
              <div
                className="w-full shrink-0 text-center"
                aria-hidden={!isDone}
              >
                {isDone && result && (
                  <div className="flex flex-col items-center py-2">
                    <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-pava-green/10 text-pava-green">
                      <Sparkles size={28} />
                    </span>
                    <span className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-pava-gold-deep">
                      Recomendación para vos
                    </span>
                    <h3 className="font-display mb-3 text-2xl font-bold text-pava-brown sm:text-3xl">
                      ¡Tu combinación ideal!
                    </h3>
                    <div className="mb-8 max-w-md rounded-control border border-pava-brown/15 bg-pava-cream-dark/40 p-4">
                      <p className="font-medium text-pava-brown">
                        {result.title}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <Link
                        href={query}
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-control bg-pava-green px-8 py-4 text-sm font-bold tracking-wide text-pava-cream shadow-lg shadow-pava-green/20 transition-all duration-200 hover:bg-pava-green-light active:scale-[0.98]"
                      >
                        Explorar productos sugeridos
                        <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                      <a
                        href={`https://wa.me/5492994119330?text=${encodeURIComponent(
                          `¡Hola Poné La Pava! Hice el test en la web y me recomendó: ${result.title}. ¿Qué opciones tienen disponibles?`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-control border border-pava-brown/20 bg-white px-6 py-4 text-sm font-semibold tracking-wide text-pava-brown transition-all duration-200 hover:border-whatsapp hover:text-whatsapp active:scale-[0.98]"
                      >
                        Consultar por WhatsApp
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="mt-8 flex items-center justify-between border-t border-pava-brown/10 pt-4 text-xs font-semibold uppercase tracking-[0.14em]">
              {step > 0 && !isDone ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-1.5 text-pava-brown-mid transition-colors hover:text-pava-brown"
                >
                  <ArrowLeft size={14} aria-hidden="true" /> Volver
                </button>
              ) : (
                <div />
              )}
              {step > 0 && (
                <button
                  type="button"
                  onClick={restart}
                  className="inline-flex items-center gap-1.5 text-pava-brown-mid/75 transition-colors hover:text-pava-brown"
                >
                  <RotateCcw size={13} /> Reiniciar test
                </button>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

