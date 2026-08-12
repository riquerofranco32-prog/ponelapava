import Image from "next/image";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="relative py-24 lg:py-36 overflow-hidden">
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
        <div className="absolute inset-0 bg-pava-brown/75" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Decorator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="w-12 h-px bg-pava-gold/50" />
          <span className="text-pava-gold text-xl">🧉</span>
          <span className="w-12 h-px bg-pava-gold/50" />
        </div>

        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-pava-cream leading-tight mb-6">
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
            className="inline-flex items-center gap-3 px-10 py-4 bg-pava-gold text-pava-brown text-sm font-semibold tracking-wide border-2 border-pava-gold hover:bg-pava-gold-light hover:border-pava-gold-light transition-all duration-200 active:scale-[0.98]"
          >
            Ver catálogo
          </Link>
          <a
            href="https://wa.me/5491100000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-4 bg-[#25D366] text-white text-sm font-semibold tracking-wide border-2 border-[#25D366] hover:bg-[#1ebe5d] transition-all duration-200 active:scale-[0.98]"
          >
            💬 Consultar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
