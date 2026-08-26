import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import ScrollReveal from "@/components/ui/ScrollReveal";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";

export default async function FeaturedProducts() {
  // Show up to 8 featured products, in-stock ones first so a sold-out
  // item doesn't bump an available one out of this prime homepage slot.
  const featuredProducts = await getFeaturedProducts();
  const displayed = [...featuredProducts]
    .sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0))
    .slice(0, 8);

  return (
    <section
      id="productos-destacados"
      className="relative overflow-hidden bg-pava-cream py-24 sm:py-28 lg:py-36"
    >
      {/* Subtle dot-grid pattern for depth */}
      <div className="bg-dots-pattern absolute inset-0 pointer-events-none opacity-70" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header — asimétrico */}
        <ScrollReveal
          direction="up"
          className="mb-14 grid gap-6 lg:grid-cols-12 lg:items-end lg:mb-18"
        >
          <div className="lg:col-span-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-9 bg-pava-gold-deep" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-gold-deep">
                Selección de la casa
              </span>
            </div>
            <h2 className="font-display text-4xl font-bold leading-[0.93] tracking-tight text-pava-brown sm:text-5xl lg:text-6xl">
              Para hacer del mate
              <br />
              <em className="not-italic text-pava-green">un mejor ritual.</em>
            </h2>
          </div>
          <div className="flex items-end justify-between gap-6 lg:col-span-5 lg:col-start-8 lg:flex-col lg:items-end lg:pb-1">
            <p className="max-w-xs text-sm leading-relaxed text-pava-brown-mid/75">
              Elegidos con criterio. Para usar todos los días.
            </p>
            <Link
              href="/catalogo"
              className="group inline-flex shrink-0 items-center gap-2 border-b border-pava-green pb-0.5 text-sm font-semibold text-pava-green transition-all hover:text-pava-terracotta hover:border-pava-terracotta"
            >
              Todo el catálogo
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </ScrollReveal>

        {/* Horizontal scroll-snap carousel — browse without leaving the section */}
        {displayed.length > 0 && (
          <ScrollReveal direction="up">
            <FeaturedCarousel products={displayed} />
          </ScrollReveal>
        )}

        {/* Bottom CTA */}
        <ScrollReveal
          direction="up"
          delay={100}
          className="mt-14 text-center sm:mt-16"
        >
          <Link
            href="/catalogo"
            id="featured-cta"
            className="inline-flex items-center gap-3 rounded-control border-2 border-pava-green bg-pava-green px-10 py-4 text-sm font-semibold tracking-wide text-pava-cream transition-all duration-200 hover:border-pava-green-light hover:bg-pava-green-light active:scale-[0.98]"
          >
            Ver todos los productos <span aria-hidden="true">→</span>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
