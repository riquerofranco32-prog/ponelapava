import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/categories";

export default function Categories() {
  return (
    <section className="py-20 lg:py-28 bg-pava-cream-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 lg:mb-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-px bg-pava-green" />
            <span className="text-xs tracking-[0.2em] uppercase text-pava-green font-medium">
              Categorías
            </span>
            <span className="w-8 h-px bg-pava-green" />
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-pava-brown">
            Encontrá lo que buscás
          </h2>
          <p className="mt-4 text-pava-brown-mid/70 max-w-md mx-auto leading-relaxed">
            Desde la yerba hasta el termo, tenemos todo lo que necesitás para
            armar el mate perfecto.
          </p>
        </div>

        {/* Grid — asymmetric layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {/* First two: large cards */}
          {categories.slice(0, 2).map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogo?cat=${cat.slug}`}
              className="group relative col-span-1 md:col-span-1 lg:col-span-2 aspect-[4/5] overflow-hidden"
              aria-label={`Ver categoría ${cat.name}`}
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pava-brown/80 via-pava-brown/20 to-transparent group-hover:from-pava-brown/70 transition-colors duration-300" />
              <div className="absolute inset-0 p-5 flex flex-col justify-end">
                <span className="text-2xl mb-2">{cat.icon}</span>
                <h3 className="font-display text-xl font-bold text-pava-cream">
                  {cat.name}
                </h3>
                <p className="text-xs text-pava-cream/70 mt-1 leading-relaxed hidden sm:block">
                  {cat.description}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs text-pava-gold font-medium mt-3 group-hover:gap-2.5 transition-all duration-200">
                  Ver productos
                  <span>→</span>
                </span>
              </div>
            </Link>
          ))}

          {/* Remaining: 4 medium cards */}
          {categories.slice(2).map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogo?cat=${cat.slug}`}
              className="group relative col-span-1 aspect-[3/4] overflow-hidden"
              aria-label={`Ver categoría ${cat.name}`}
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pava-brown/80 via-pava-brown/20 to-transparent group-hover:from-pava-brown/70 transition-colors duration-300" />
              <div className="absolute inset-0 p-4 flex flex-col justify-end">
                <span className="text-xl mb-1.5">{cat.icon}</span>
                <h3 className="font-display text-base font-bold text-pava-cream">
                  {cat.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs text-pava-gold font-medium mt-2 group-hover:gap-2 transition-all duration-200">
                  Ver
                  <span>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
