import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/categories";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { Category as CategoryData } from "@/types";

export default function Categories() {
  const [yerba, mates, bombillas, termos, accesorios, combos] = categories;

  return (
    <section className="bg-pava-brown py-24 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header — lateral, editorial */}
        <ScrollReveal
          direction="up"
          className="mb-12 flex flex-col gap-5 sm:mb-14 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-9 bg-pava-gold" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-gold">
                Elegí por ritual
              </span>
            </div>
            <h2 className="font-display text-4xl font-bold leading-[0.93] tracking-tight text-pava-cream sm:text-5xl lg:text-6xl">
              Todo empieza por
              <br />
              <em className="not-italic text-pava-terracotta">
                una buena elección.
              </em>
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-pava-cream/50 sm:text-right">
            De la yerba que te acompaña cada mañana al detalle que completa una
            ronda inolvidable.
          </p>
        </ScrollReveal>

        {/* Mobile / tablet — horizontal editorial scroller */}
        <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:hidden">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className="w-[78vw] shrink-0 snap-start sm:w-[46vw]"
            >
              <CategoryCard
                cat={cat}
                index={i}
                className="aspect-[3/4]"
                size="large"
                badge={i === 0}
              />
            </div>
          ))}
        </div>

        {/* Desktop — asymmetric mosaic */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:grid-rows-2 lg:gap-3">
          {/* YERBAS — tall left */}
          <ScrollReveal
            direction="scale"
            delay={0}
            className="category-card lg:col-span-4 lg:row-span-2"
          >
            <CategoryCard
              cat={yerba}
              index={0}
              className="lg:h-full lg:min-h-[560px]"
              size="large"
              badge
            />
          </ScrollReveal>

          {/* MATES — wide top right */}
          <ScrollReveal
            direction="scale"
            delay={60}
            className="category-card lg:col-span-5 lg:row-span-1"
          >
            <CategoryCard
              cat={mates}
              index={1}
              className="lg:h-full lg:min-h-[270px]"
              size="medium"
            />
          </ScrollReveal>

          {/* TERMOS — narrow top far right */}
          <ScrollReveal
            direction="scale"
            delay={120}
            className="category-card lg:col-span-3 lg:row-span-1"
          >
            <CategoryCard
              cat={termos}
              index={2}
              className="lg:h-full lg:min-h-[270px]"
              size="small"
            />
          </ScrollReveal>

          {/* BOMBILLAS — bottom middle */}
          <ScrollReveal
            direction="scale"
            delay={80}
            className="category-card lg:col-span-3 lg:col-start-5 lg:row-span-1"
          >
            <CategoryCard
              cat={bombillas}
              index={3}
              className="lg:h-full"
              size="small"
            />
          </ScrollReveal>

          {/* ACCESORIOS — bottom center-right */}
          <ScrollReveal
            direction="scale"
            delay={140}
            className="category-card lg:col-span-2 lg:col-start-8 lg:row-span-1"
          >
            <CategoryCard
              cat={accesorios}
              index={4}
              className="lg:h-full"
              size="small"
            />
          </ScrollReveal>

          {/* COMBOS — bottom far right */}
          <ScrollReveal
            direction="scale"
            delay={200}
            className="category-card lg:col-span-3 lg:col-start-10 lg:row-span-1"
          >
            <CategoryCard
              cat={combos}
              index={5}
              className="lg:h-full"
              size="small"
            />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  cat,
  className,
  size,
  index,
  badge = false,
}: {
  cat: CategoryData;
  className: string;
  size: "large" | "medium" | "small";
  index: number;
  badge?: boolean;
}) {
  return (
    <Link
      href={`/catalogo?cat=${cat.slug}`}
      className={`group relative block h-full overflow-hidden bg-pava-brown-mid ${className}`}
      aria-label={`Ver categoría ${cat.name}`}
    >
      <Image
        src={cat.image}
        alt={cat.name}
        fill
        className="object-cover opacity-85 transition-all duration-700 ease-out group-hover:scale-[1.055] group-hover:opacity-100"
        sizes={
          size === "large"
            ? "(max-width: 1024px) 78vw, 34vw"
            : size === "medium"
              ? "(max-width: 1024px) 46vw, 42vw"
              : "(max-width: 1024px) 46vw, 25vw"
        }
      />
      {/* Gradient overlay */}
      <div className="cat-overlay absolute inset-0" />

      {/* Index number — editorial marker, consistent across all sizes */}
      <span className="absolute right-4 top-4 font-display text-xs font-bold text-pava-cream/50 sm:right-5 sm:top-5">
        0{index + 1}
      </span>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 lg:p-6">
        {badge && (
          <div className="mb-auto pt-3">
            <span className="inline-block border border-pava-cream/25 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-pava-cream/70">
              Explorar
            </span>
          </div>
        )}

        <div>
          <h3
            className={`font-display font-bold leading-none text-pava-cream ${
              size === "large"
                ? "mb-2 text-3xl sm:text-4xl"
                : size === "medium"
                  ? "mb-1.5 text-2xl sm:text-3xl"
                  : "mb-1 text-lg sm:text-xl"
            }`}
          >
            {cat.name}
          </h3>

          {size !== "small" && (
            <p className="mb-3 max-w-xs text-[13px] leading-relaxed text-pava-cream/65">
              {cat.description}
            </p>
          )}

          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-pava-gold transition-all duration-200 group-hover:gap-2.5">
            Ver productos <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
