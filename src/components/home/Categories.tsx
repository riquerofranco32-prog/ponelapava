import Link from "next/link";
import { getCategories } from "@/lib/categories";
import ScrollReveal from "@/components/ui/ScrollReveal";
import CategoryCard from "./CategoryCard";

export default async function Categories() {
  const categories = await getCategories();

  // Bento layout: the first card takes a 2x2 spot, the rest fill a 4-col
  // strip beside/below it. If the trailing row doesn't fill up (e.g. 6 or 7
  // categories), stretch its last items so there's no dangling gap.
  // Only handles remainders that split evenly (1 or 2 leftover); a remainder
  // of 3 falls back to a 1-column gap, since 4 doesn't divide by 3.
  const smallCount = categories.length - 1;
  const remainder = smallCount % 4;
  const trailingSpanClass =
    remainder === 1 ? "lg:col-span-4" : remainder === 2 ? "lg:col-span-2" : "";

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

        {/* Photo cards — real category imagery instead of generic icons.
            First card gets the bento hero spot on desktop. */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-5">
          {categories.map((cat, i) => {
            const isTrailing =
              remainder > 0 && i >= categories.length - remainder;
            return (
              <ScrollReveal
                key={cat.id}
                direction="up"
                delay={i * 60}
                className={
                  i === 0
                    ? "col-span-2 sm:col-span-1 lg:col-span-2 lg:row-span-2"
                    : isTrailing
                      ? trailingSpanClass
                      : ""
                }
              >
                <CategoryCard cat={cat} featured={i === 0} />
              </ScrollReveal>
            );
          })}
        </div>

        {/* CTA banner */}
        <ScrollReveal direction="up" delay={200} className="mt-14 lg:mt-16">
          <Link
            href="/catalogo"
            className="group flex items-center justify-between gap-4 rounded-control border border-pava-brown/15 px-5 py-6 transition-colors duration-300 hover:border-pava-green/50 sm:px-6"
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
