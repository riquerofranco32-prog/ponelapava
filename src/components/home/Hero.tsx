import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-end overflow-hidden"
      aria-label="Bienvenida a Poné La Pava"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero_background_1786545961305.png"
          alt="Mate en mesa de madera — Poné La Pava"
          fill
          priority
          quality={90}
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Gradient overlay: bottom-heavy, editorial */}
        <div className="absolute inset-0 bg-gradient-to-t from-pava-brown via-pava-brown/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-pava-brown/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 lg:pb-28 pt-32">
        <div className="max-w-2xl">
          {/* Label */}
          <div className="animate-fade-in-up animate-delay-100 inline-flex items-center gap-2 mb-6">
            <span className="w-6 h-px bg-pava-gold" />
            <span className="text-xs tracking-[0.25em] uppercase font-medium text-pava-gold">
              Yerbas · Mates · Accesorios
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up animate-delay-200 font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-pava-cream leading-[0.9] tracking-tight mb-6">
            El ritual <br />
            <em className="not-italic text-pava-gold">del mate</em>
            <br />
            es tuyo.
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-in-up animate-delay-300 text-base sm:text-lg text-pava-cream/75 leading-relaxed mb-10 max-w-md">
            Yerbas seleccionadas, mates artesanales, termos y todo lo que
            necesitás para vivir el mate como se merece.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up animate-delay-400 flex flex-wrap gap-4">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 px-8 py-4 bg-pava-gold text-pava-brown text-sm font-semibold tracking-wide border-2 border-pava-gold hover:bg-pava-gold-light hover:border-pava-gold-light transition-all duration-200 active:scale-[0.98]"
            >
              Ver catálogo
            </Link>
            <Link
              href="/#el-local"
              className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-pava-cream text-sm font-semibold tracking-wide border-2 border-pava-cream/40 hover:border-pava-cream hover:bg-pava-cream/10 transition-all duration-200 active:scale-[0.98]"
            >
              Conocé nuestro local
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-fade-in animate-delay-600 hidden sm:flex flex-col items-center gap-2">
        <span className="text-[10px] tracking-[0.2em] uppercase text-pava-cream/40">
          Scroll
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-pava-cream/40 to-transparent" />
      </div>
    </section>
  );
}
