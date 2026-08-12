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
      <article className="group flex gap-4 bg-white border border-pava-brown/8 hover:shadow-md transition-all duration-300 p-4">
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
    <article className="group bg-white border border-pava-brown/8 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/producto/${product.id}`} aria-label={`Ver ${product.name}`}>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>
        {isFeatured && !isOutOfStock && (
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

      {/* Content */}
      <div className="p-5">
        <Badge variant="category" className="mb-2">{getCategoryLabel(product.category)}</Badge>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/producto/${product.id}`}>
            <h3 className="font-medium text-pava-brown hover:text-pava-green transition-colors leading-tight">
              {product.name}
            </h3>
          </Link>
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
