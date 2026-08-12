import Link from "next/link";
import { featuredProducts } from "@/data/products";
import ProductCard from "@/components/catalog/ProductCard";

export default function FeaturedProducts() {
  const displayed = featuredProducts.slice(0, 6);

  return (
    <section className="relative overflow-hidden bg-pava-cream py-20 sm:py-24 lg:py-32">
      <div className="pointer-events-none absolute left-0 top-20 h-56 w-56 -translate-x-1/2 rounded-full bg-pava-gold/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-5 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-9 bg-pava-terracotta" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-pava-terracotta">
                Selección de la casa
              </span>
            </div>
            <h2 className="font-display text-4xl font-bold leading-[0.95] tracking-tight text-pava-brown sm:text-5xl lg:text-6xl">
              Para hacer del mate<br className="hidden sm:block" /> un{" "}
              <em className="not-italic text-pava-green">mejor ritual.</em>
            </h2>
          </div>
          <div className="flex items-center gap-5 sm:pb-1">
            <p className="max-w-44 text-xs leading-relaxed text-pava-brown-mid/65">
              Elegidos con criterio, para usar todos los días.
            </p>
            <Link
              href="/catalogo"
              className="group inline-flex shrink-0 items-center gap-2 border-b border-pava-green pb-1 text-sm font-semibold text-pava-green transition-colors hover:text-pava-terracotta"
            >
              Ver catálogo
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {displayed.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-10 text-center sm:mt-14">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-3 border-2 border-pava-green bg-pava-green px-8 py-3.5 text-sm font-semibold tracking-wide text-pava-cream transition-all duration-200 hover:border-pava-green-light hover:bg-pava-green-light active:scale-[0.98]"
          >
            Explorar todos los productos <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
