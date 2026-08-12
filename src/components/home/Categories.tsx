import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/categories";

export default function Categories() {
  return (
    <section className="bg-pava-cream-dark py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 grid gap-6 sm:mb-14 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-9 bg-pava-green" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-pava-green">
                Elegí por ritual
              </span>
            </div>
            <h2 className="font-display text-4xl font-bold leading-[0.95] tracking-tight text-pava-brown sm:text-5xl lg:text-6xl">
              Todo empieza por<br />
              <em className="not-italic text-pava-terracotta">una buena elección.</em>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-pava-brown-mid/70 lg:col-span-4 lg:col-start-9">
            De la yerba que te acompaña todos los días al detalle que completa
            una ronda inolvidable.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12 lg:gap-5">
          {categories.map((cat, index) => (
            <Link
              key={cat.id}
              href={"/catalogo?cat=" + cat.slug}
              className={
                "group relative overflow-hidden bg-pava-brown " +
                (index < 2
                  ? "aspect-[4/5] lg:col-span-6"
                  : "aspect-[3/4] lg:col-span-3")
              }
              aria-label={"Ver categoría " + cat.name}
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover opacity-90 transition duration-700 ease-out group-hover:scale-[1.055] group-hover:opacity-100"
                sizes={index < 2 ? "(max-width: 1024px) 50vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pava-brown/90 via-pava-brown/20 to-transparent transition-colors duration-300 group-hover:from-pava-brown/75" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 lg:p-6">
                <div className="mb-8 flex items-center justify-between sm:mb-12">
                  <span className="text-2xl drop-shadow-sm">{cat.icon}</span>
                  <span className="border border-pava-cream/35 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-pava-cream/80">
                    {index < 2 ? "Explorar" : "Ver"}
                  </span>
                </div>
                <h3 className={
                  "font-display font-bold leading-none text-pava-cream " +
                  (index < 2 ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl")
                }>
                  {cat.name}
                </h3>
                {index < 2 && (
                  <p className="mt-2 max-w-xs text-xs leading-relaxed text-pava-cream/70 sm:text-sm">
                    {cat.description}
                  </p>
                )}
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-pava-gold transition-all duration-200 group-hover:gap-3">
                  Ver productos <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
