import Link from "next/link";
import { featuredProducts } from "@/data/products";
import ProductCard from "@/components/catalog/ProductCard";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function FeaturedProducts() {
  // Show up to 6 featured products
  const displayed = featuredProducts.slice(0, 6);
  const [first, ...rest] = displayed;
  const second = rest[0];
  const third = rest[1];
  const remaining = rest.slice(2);

  return (
    <section
      id="productos-destacados"
      className="relative overflow-hidden bg-pava-cream py-24 sm:py-28 lg:py-36"
    >
      {/* Subtle ambient orb */}
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-pava-gold/7 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 bottom-1/4 h-56 w-56 rounded-full bg-pava-terracotta/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

        {/* Header — asimétrico */}
        <ScrollReveal direction="up" className="mb-14 grid gap-6 lg:grid-cols-12 lg:items-end lg:mb-18">
          <div className="lg:col-span-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-9 bg-pava-terracotta" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-terracotta">
                Selección de la casa
              </span>
            </div>
            <h2 className="font-display text-4xl font-bold leading-[0.93] tracking-tight text-pava-brown sm:text-5xl lg:text-6xl">
              Para hacer del mate<br />
              <em className="not-italic text-pava-green">un mejor ritual.</em>
            </h2>
          </div>
          <div className="flex items-end justify-between gap-6 lg:col-span-5 lg:col-start-8 lg:flex-col lg:items-end lg:pb-1">
            <p className="max-w-xs text-sm leading-relaxed text-pava-brown-mid/60">
              Elegidos con criterio. Para usar todos los días.
            </p>
            <Link
              href="/catalogo"
              className="group inline-flex shrink-0 items-center gap-2 border-b border-pava-green pb-0.5 text-sm font-semibold text-pava-green transition-all hover:text-pava-terracotta hover:border-pava-terracotta"
            >
              Todo el catálogo
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </ScrollReveal>

        {/* Editorial grid — row 1: 1 large + 2 medium */}
        {displayed.length > 0 && (
          <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
            {/* Large card */}
            {first && (
              <ScrollReveal direction="up" delay={0} className="sm:col-span-2 lg:col-span-5">
                <ProductCard product={first} featured />
              </ScrollReveal>
            )}
            {/* Two medium cards */}
            {second && (
              <ScrollReveal direction="up" delay={80} className="lg:col-span-3 lg:col-start-6">
                <ProductCard product={second} />
              </ScrollReveal>
            )}
            {third && (
              <ScrollReveal direction="up" delay={160} className="lg:col-span-4 lg:col-start-9">
                <ProductCard product={third} />
              </ScrollReveal>
            )}
          </div>
        )}

        {/* Row 2 — remaining cards equal */}
        {remaining.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {remaining.map((product, i) => (
              <ScrollReveal key={product.id} direction="up" delay={i * 80}>
                <ProductCard product={product} />
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <ScrollReveal direction="up" delay={100} className="mt-14 text-center sm:mt-16">
          <Link
            href="/catalogo"
            id="featured-cta"
            className="inline-flex items-center gap-3 border-2 border-pava-green bg-pava-green px-10 py-4 text-sm font-semibold tracking-wide text-pava-cream transition-all duration-200 hover:border-pava-green-light hover:bg-pava-green-light active:scale-[0.98]"
          >
            Ver todos los productos <span aria-hidden="true">→</span>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
