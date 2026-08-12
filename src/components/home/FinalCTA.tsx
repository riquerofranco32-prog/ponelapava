import Image from "next/image";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="grain-overlay relative overflow-hidden py-24 sm:py-28 lg:py-40">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero_background_1786545961305.png"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-pava-brown/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-pava-brown/60 via-transparent to-pava-brown/45" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Decorator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="w-12 h-px bg-pava-gold/50" />
          <span className="text-pava-gold text-xl">🧉</span>
          <span className="w-12 h-px bg-pava-gold/50" />
        </div>

        <h2 className="font-display mb-7 text-5xl font-bold leading-[0.92] tracking-tight text-pava-cream sm:text-6xl lg:text-7xl xl:text-8xl">
          ¿Ya sabés qué vas<br />
          a poner en la{" "}
          <em className="not-italic text-pava-gold">pava?</em>
        </h2>

        <p className="text-pava-cream/70 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Explorá nuestro catálogo y encontrá todo lo que necesitás para el
          mate que siempre soñaste.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/catalogo"
          className="inline-flex items-center gap-3 border-2 border-pava-gold bg-pava-gold px-8 py-4 text-sm font-bold tracking-wide text-pava-brown transition-all duration-200 hover:border-pava-gold-light hover:bg-pava-gold-light active:scale-[0.98] sm:px-10"
          >
            Ver catálogo
          </Link>
          <a
            href="https://wa.me/5491100000000"
            target="_blank"
            rel="noopener noreferrer"
          className="inline-flex items-center gap-3 border border-pava-cream/35 bg-pava-cream/10 px-8 py-4 text-sm font-semibold tracking-wide text-pava-cream backdrop-blur-sm transition-all duration-200 hover:border-[#25D366] hover:bg-[#25D366] sm:px-10"
          >
            💬 Consultar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
