import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

interface BrandItem {
  name: string;
  category: string;
  origin: string;
  highlight: string;
  query: string;
}

const BRANDS: BrandItem[] = [
  {
    name: "Stanley",
    category: "Termos & Térmicos",
    origin: "Internacional",
    highlight: "Conservación extrema",
    query: "stanley",
  },
  {
    name: "Canarias",
    category: "Yerba Despalada",
    origin: "Uruguay / Brasil",
    highlight: "Sabor intenso y duradero",
    query: "canarias",
  },
  {
    name: "Sara",
    category: "Yerba Mate",
    origin: "Uruguay",
    highlight: "Suave y balanceada",
    query: "sara",
  },
  {
    name: "Baldo",
    category: "Yerba Estilo Uruguayo",
    origin: "Uruguay",
    highlight: "Molienda fina premium",
    query: "baldo",
  },
  {
    name: "Amanda",
    category: "Yerba Tradicional",
    origin: "Misiones, Arg",
    highlight: "Clásica y compuesta",
    query: "amanda",
  },
  {
    name: "Playadito",
    category: "Yerba Suave",
    origin: "Corrientes, Arg",
    highlight: "Secado tradicional",
    query: "playadito",
  },
  {
    name: "Lumilagro",
    category: "Termos",
    origin: "Argentina",
    highlight: "Pico cebador y resistencia",
    query: "lumilagro",
  },
  {
    name: "Del Cebador",
    category: "Yerba Compuesta",
    origin: "Uruguay",
    highlight: "Ronda prolongada",
    query: "cebador",
  },
  {
    name: "Rei Verde",
    category: "Yerba Especial",
    origin: "Brasil",
    highlight: "Pura hoja seleccionada",
    query: "rei verde",
  },
  {
    name: "La Merced",
    category: "Yerba de Autor",
    origin: "Argentina",
    highlight: "Campo y Monte",
    query: "la merced",
  },
];

export default function BrandsSection() {
  return (
    <section className="relative overflow-hidden bg-pava-cream-dark/50 py-20 sm:py-24 lg:py-28 border-b border-pava-brown/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <ScrollReveal
          direction="up"
          className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-9 bg-pava-gold-deep" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-gold-deep">
                Marcas que nos acompañan
              </span>
            </div>
            <h2 className="font-display text-3xl font-bold leading-[0.95] tracking-tight text-pava-brown sm:text-4xl lg:text-5xl">
              Las mejores marcas,
              <br />
              <em className="not-italic text-pava-green">en tu próxima ronda.</em>
            </h2>
          </div>
          <p className="max-w-xs text-xs sm:text-sm leading-relaxed text-pava-brown-mid/75">
            Seleccionamos marcas prestigiosas y artesanales de Argentina y el mundo para garantizar la mejor experiencia.
          </p>
        </ScrollReveal>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:gap-4">
          {BRANDS.map((brand, i) => (
            <ScrollReveal
              key={brand.name}
              direction="up"
              delay={i * 45}
              className="h-full"
            >
              <Link
                href={`/catalogo?q=${encodeURIComponent(brand.query)}`}
                className="group relative flex h-full flex-col justify-between rounded-card border border-pava-brown/12 bg-white/80 p-4.5 backdrop-blur-xs transition-all duration-300 hover:-translate-y-1 hover:border-pava-gold/70 hover:bg-white hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-pava-gold-deep">
                      {brand.origin}
                    </span>
                    <span className="text-xs text-pava-brown-mid/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-pava-green">
                      →
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-pava-brown transition-colors group-hover:text-pava-green">
                    {brand.name}
                  </h3>
                  <p className="mt-1 text-[11px] font-medium text-pava-brown-mid/70">
                    {brand.category}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-pava-brown/8">
                  <span className="inline-block text-[10px] text-pava-terracotta font-semibold">
                    {brand.highlight}
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
