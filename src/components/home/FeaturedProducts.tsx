import Link from "next/link";
import Image from "next/image";
import { featuredProducts } from "@/data/products";
import { formatPrice, getCategoryLabel, truncate } from "@/lib/utils";
import AddToCartButton from "@/components/catalog/AddToCartButton";
import Badge from "@/components/ui/Badge";
import { Product } from "@/types";

function ProductCard({ product }: { product: Product }) {
  const isOutOfStock = product.status === "out_of_stock";
  const isFeatured = product.status === "featured";

  return (
    <article className="group bg-white border border-pava-brown/8 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/producto/${product.id}`} aria-label={`Ver ${product.name}`}>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </Link>
        {/* Status badge */}
        {isFeatured && (
          <div className="absolute top-3 left-3">
            <Badge variant="featured">Destacado</Badge>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-pava-brown/50 flex items-center justify-center">
            <span className="bg-pava-cream text-pava-brown text-xs font-semibold tracking-wider uppercase px-4 py-2">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <span className="text-[10px] tracking-[0.15em] uppercase text-pava-brown-mid/60 font-medium">
              {getCategoryLabel(product.category)}
            </span>
            <Link href={`/producto/${product.id}`}>
              <h3 className="font-medium text-pava-brown mt-0.5 leading-tight hover:text-pava-green transition-colors duration-200">
                {product.name}
              </h3>
            </Link>
          </div>
          <span className="font-display text-lg font-bold text-pava-green shrink-0">
            {formatPrice(product.price)}
          </span>
        </div>

        <p className="text-sm text-pava-brown-mid/70 leading-relaxed mb-4">
          {truncate(product.description, 70)}
        </p>

        <AddToCartButton product={product} disabled={isOutOfStock} />
      </div>
    </article>
  );
}

export default function FeaturedProducts() {
  const displayed = featuredProducts.slice(0, 6);

  return (
    <section className="py-20 lg:py-28 bg-pava-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 lg:mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-px bg-pava-green" />
            <span className="text-xs tracking-[0.2em] uppercase text-pava-green font-medium">
              Selección
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-pava-brown">
              Lo que más<br />
              <em className="not-italic text-pava-green">elegimos</em>
            </h2>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 text-sm font-medium text-pava-green hover:text-pava-green-light transition-colors duration-200 group"
            >
              Ver todo el catálogo
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayed.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 lg:mt-16 text-center">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-3 px-10 py-4 bg-pava-green text-pava-cream text-sm font-semibold tracking-wide border-2 border-pava-green hover:bg-pava-green-light hover:border-pava-green-light transition-all duration-200 active:scale-[0.98]"
          >
            Ver todo el catálogo
          </Link>
        </div>
      </div>
    </section>
  );
}
