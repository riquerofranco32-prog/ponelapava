"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

// One-line edit for the shop owner: map each answer to a real category
// slug (src/lib/categories.ts / supabase `categories.slug`) + search tag.
const ANSWER_MAP = {
  recien_arranco: { slug: "mates", tag: "iniciacion" },
  todos_los_dias: { slug: "mates", tag: "diario" },
  amargo: { slug: "yerbas", tag: "amargas" },
  saborizada: { slug: "yerbas", tag: "saborizadas" },
  en_casa: { slug: "combos", tag: "hogar" },
  para_llevar: { slug: "termos", tag: "portatil" },
} as const;

type AnswerKey = keyof typeof ANSWER_MAP;

const QUESTIONS: { question: string; options: [string, AnswerKey][] }[] = [
  {
    question: "¿Recién arrancás o ya tomás todos los días?",
    options: [
      ["Recién arranco", "recien_arranco"],
      ["Todos los días", "todos_los_dias"],
    ],
  },
  {
    question: "¿Amargo o con gusto?",
    options: [
      ["Amargo", "amargo"],
      ["Con yerba saborizada", "saborizada"],
    ],
  },
  {
    question: "¿En casa o para llevar?",
    options: [
      ["En casa", "en_casa"],
      ["Para llevar", "para_llevar"],
    ],
  },
];

export default function MateMatcher() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerKey[]>([]);

  const isDone = step >= QUESTIONS.length;
  // Last answer decides the category; the flavor/usage answers ride along as tags.
  const result = isDone ? ANSWER_MAP[answers[answers.length - 1]] : null;
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
        <ScrollReveal direction="up" className="mb-12 text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-9 bg-pava-gold-deep" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-gold-deep">
              Encontrá el tuyo
            </span>
            <span className="h-px w-9 bg-pava-gold-deep" />
          </div>
          <h2 className="font-display text-4xl font-bold leading-[0.93] tracking-tight text-pava-brown sm:text-5xl">
            ¿Qué mate va{" "}
            <em className="not-italic text-pava-terracotta">con vos?</em>
          </h2>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={100}>
          <div className="relative overflow-hidden rounded-control border border-pava-brown/15 bg-white px-6 py-10 shadow-sm sm:px-12 sm:py-14">
            {/* Horizontal step track — each step is a fixed-width pane sliding
                left as `step` advances, single sliding strip. */}
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${Math.min(step, QUESTIONS.length) * 100}%)`,
              }}
            >
              {QUESTIONS.map((q, i) => (
                <div
                  key={q.question}
                  className="w-full shrink-0 px-1 text-center"
                  aria-hidden={step !== i}
                >
                  <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.2em] text-pava-gold-deep/70">
                    Paso {i + 1} de {QUESTIONS.length}
                  </span>
                  <h3 className="font-display mb-8 text-2xl font-bold text-pava-brown sm:text-3xl">
                    {q.question}
                  </h3>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    {q.options.map(([label, key]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => selectAnswer(key)}
                        className="rounded-control border-2 border-pava-brown/15 px-6 py-4 text-sm font-semibold text-pava-brown transition-all duration-200 hover:border-pava-gold hover:bg-pava-cream-dark active:scale-[0.98] sm:min-w-[200px]"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Result pane */}
              <div
                className="w-full shrink-0 px-1 text-center"
                aria-hidden={!isDone}
              >
                {isDone && (
                  <>
                    <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.2em] text-pava-gold-deep/70">
                      Tu combinación
                    </span>
                    <h3 className="font-display mb-8 text-2xl font-bold text-pava-brown sm:text-3xl">
                      Ya sabemos qué buscás.
                    </h3>
                    <Link
                      href={query}
                      className="inline-flex items-center gap-3 rounded-control bg-pava-brown px-10 py-4 text-sm font-semibold tracking-wide text-pava-cream transition-all duration-200 hover:bg-pava-green active:scale-[0.98]"
                    >
                      Ver mis mates <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Back / restart controls */}
            <div className="mt-10 flex items-center justify-center gap-6 text-xs font-semibold uppercase tracking-[0.14em]">
              {step > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-1.5 text-pava-brown-mid transition-colors hover:text-pava-brown"
                >
                  <ArrowLeft size={14} aria-hidden="true" /> Volver
                </button>
              )}
              {step > 0 && (
                <button
                  type="button"
                  onClick={restart}
                  className="text-pava-brown-mid transition-colors hover:text-pava-brown"
                >
                  Empezar de nuevo
                </button>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
