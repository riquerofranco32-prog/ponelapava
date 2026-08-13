import Link from "next/link";
import {
  Leaf,
  Coffee,
  Sparkles,
  Thermometer,
  ShoppingBag,
  Gift,
} from "lucide-react";
import { categories } from "@/data/categories";
import ScrollReveal from "@/components/ui/ScrollReveal";

const ICONS = {
  yerbas: Leaf,
  mates: Coffee,
  bombillas: Sparkles,
  termos: Thermometer,
  accesorios: ShoppingBag,
  combos: Gift,
} as const;

export default function Categories() {
  return (
    <section className="bg-pava-cream-dark py-24 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header — lateral, editorial */}
        <ScrollReveal
          direction="up"
          className="mb-14 flex flex-col gap-5 sm:mb-16 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-9 bg-pava-gold-deep" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-gold-deep">
                Explorá por categoría
              </span>
            </div>
            <h2 className="font-display text-4xl font-bold leading-[0.93] tracking-tight text-pava-brown sm:text-5xl lg:text-6xl">
              Todo lo que necesitás
              <br />
              <em className="not-italic text-pava-terracotta">
                para tu ritual.
              </em>
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="group inline-flex w-fit shrink-0 items-center gap-2 border-b border-pava-brown pb-0.5 text-sm font-semibold text-pava-brown transition-all hover:border-pava-green hover:text-pava-green"
          >
            Ver todo el catálogo
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </ScrollReveal>

        {/* Icon circle row */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-10 sm:grid-cols-6 sm:gap-x-6">
          {categories.map((cat, i) => {
            const Icon = ICONS[cat.slug as keyof typeof ICONS] ?? Leaf;
            return (
              <ScrollReveal
                key={cat.id}
                direction="up"
                delay={i * 60}
                className="flex flex-col items-center"
              >
                <Link
                  href={`/catalogo?cat=${cat.slug}`}
                  className="group flex flex-col items-center gap-3.5 text-center"
                  aria-label={`Ver categoría ${cat.name}`}
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-pava-cream text-pava-brown shadow-[var(--shadow-card)] transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-pava-brown group-hover:text-pava-cream sm:h-20 sm:w-20">
                    <Icon size={26} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-pava-brown sm:text-xs">
                    {cat.name}
                  </span>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>

        {/* CTA banner */}
        <ScrollReveal direction="up" delay={200} className="mt-14 lg:mt-16">
          <Link
            href="/catalogo"
            className="group flex items-center justify-between gap-4 border border-pava-brown/15 px-5 py-6 transition-colors duration-300 hover:border-pava-green/50 sm:px-6"
          >
            <span className="font-display text-xl font-bold text-pava-brown sm:text-2xl">
              ¿Ya sabés qué buscás?{" "}
              <em className="not-italic text-pava-green">
                Ver el catálogo completo.
              </em>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-pava-green transition-all duration-200 group-hover:gap-2.5">
              Explorar todo <span aria-hidden="true">→</span>
            </span>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
