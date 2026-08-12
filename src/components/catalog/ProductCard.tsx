import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice, getCategoryLabel, truncate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import AddToCartButton from "./AddToCartButton";

interface ProductCardProps {
  product: Product;
  view?: "grid" | "list";
}

export default function ProductCard({ product, view = "grid" }: ProductCardProps) {
  const isOutOfStock = product.status === "out_of_stock";
  const isFeatured = product.status === "featured";

  if (view === "list") {
    return (
      <article className="group flex gap-4 border border-pava-brown/10 bg-white p-4 shadow-[0_10px_30px_-26px_rgba(28,18,9,0.8)] transition-all duration-300 hover:-translate-y-0.5 hover:border-pava-brown/20 hover:shadow-[0_20px_40px_-26px_rgba(28,18,9,0.8)] sm:p-5">
        <div className="relative w-24 h-24 shrink-0 overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="96px"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-pava-brown/50 flex items-center justify-center">
              <span className="text-[10px] text-white font-semibold">Agotado</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="category">{getCategoryLabel(product.category)}</Badge>
              {isFeatured && <Badge variant="featured">Destacado</Badge>}
            </div>
            <Link href={`/producto/${product.id}`}>
              <h3 className="font-medium text-pava-brown hover:text-pava-green transition-colors leading-tight">
                {product.name}
              </h3>
            </Link>
            <p className="text-xs text-pava-brown-mid/60 mt-1">{truncate(product.description, 80)}</p>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="font-display text-lg font-bold text-pava-green">
              {formatPrice(product.price)}
            </span>
            <div className="w-32">
              <AddToCartButton product={product} disabled={isOutOfStock} size="sm" />
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group overflow-hidden border border-pava-brown/10 bg-white shadow-[0_14px_34px_-30px_rgba(28,18,9,0.9)] transition-all duration-300 hover:-translate-y-1 hover:border-pava-brown/20 hover:shadow-[0_24px_45px_-28px_rgba(28,18,9,0.85)]">
      {/* Image */}
      <div className="relative aspect-[5/4] overflow-hidden bg-pava-cream-dark">
        <Link href={`/producto/${product.id}`} aria-label={`Ver ${product.name}`}>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>
        {isFeatured && !isOutOfStock && (
          <div className="absolute left-3 top-3">
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

      {/* Content */}
      <div className="p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Badge variant="category">{getCategoryLabel(product.category)}</Badge>
          <span className="font-display shrink-0 text-xl font-bold leading-none text-pava-green">
            {formatPrice(product.price)}
          </span>
        </div>
        <div className="mb-2 flex items-start justify-between gap-2">
          <Link href={`/producto/${product.id}`}>
            <h3 className="font-display text-xl font-bold leading-tight text-pava-brown transition-colors hover:text-pava-green">
              {product.name}
            </h3>
          </Link>
        </div>
        <p className="mb-5 min-h-10 text-sm leading-relaxed text-pava-brown-mid/70">
          {truncate(product.description, 70)}
        </p>
        <AddToCartButton product={product} disabled={isOutOfStock} />
      </div>
    </article>
  );
}
