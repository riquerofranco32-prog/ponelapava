import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/categories";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default async function Categories() {
  const categories = await getCategories();
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

        {/* Photo cards — real category imagery instead of generic icons */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-5">
          {categories.map((cat, i) => (
            <ScrollReveal key={cat.id} direction="up" delay={i * 60}>
              <Link
                href={`/catalogo?cat=${cat.slug}`}
                aria-label={`Ver categoría ${cat.name}`}
                className="img-hover-zoom group relative block aspect-[3/4] overflow-hidden rounded-card bg-pava-brown"
              >
                {cat.image && (
                  <Image
                    src={cat.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 16vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-pava-brown/85 via-pava-brown/10 to-transparent transition-colors duration-300 group-hover:from-pava-brown/90" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3.5 sm:p-4">
                  {cat.icon && (
                    <span className="text-lg leading-none" aria-hidden="true">
                      {cat.icon}
                    </span>
                  )}
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-pava-cream sm:text-xs">
                    {cat.name}
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
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
