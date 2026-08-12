import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="grain-overlay relative flex min-h-[42rem] items-end overflow-hidden sm:min-h-[46rem] lg:min-h-screen"
      aria-label="Bienvenida a Poné La Pava"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero_background_1786545961305.png"
          alt="Mate servido sobre una mesa de madera"
          fill
          priority
          quality={90}
          className="object-cover object-[58%_center] sm:object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pava-brown via-pava-brown/60 to-pava-brown/5" />
        <div className="absolute inset-0 bg-gradient-to-r from-pava-brown/70 via-pava-brown/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-pava-brown/55 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 pt-32 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <div className="max-w-3xl">
          <div className="animate-fade-in-up animate-delay-100 mb-7 flex items-center gap-3">
            <span className="h-px w-10 bg-pava-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.27em] text-pava-gold sm:text-xs">
              Poné La Pava · Tienda matera
            </span>
          </div>

          <h1 className="animate-fade-in-up animate-delay-200 font-display text-[3.5rem] font-bold leading-[0.88] tracking-[-0.045em] text-pava-cream sm:text-7xl lg:text-8xl xl:text-[6.6rem]">
            El ritual<br />
            <em className="not-italic text-pava-gold">del mate</em><br />
            es tuyo.
          </h1>

          <div className="animate-fade-in-up animate-delay-300 mt-7 flex max-w-xl flex-col gap-5 sm:mt-8 sm:flex-row sm:items-end sm:gap-7">
            <p className="max-w-md text-base leading-relaxed text-pava-cream/80 sm:text-lg">
              Yerbas seleccionadas, mates artesanales y accesorios para
              acompañar cada ronda.
            </p>
            <span className="hidden h-11 w-px bg-pava-cream/25 sm:block" />
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-pava-cream/55 sm:w-28">
              Hecho para compartir
            </p>
          </div>

          <div className="animate-fade-in-up animate-delay-400 mt-9 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center gap-3 border-2 border-pava-gold bg-pava-gold px-7 py-4 text-sm font-bold tracking-wide text-pava-brown transition-all duration-200 hover:border-pava-gold-light hover:bg-pava-gold-light active:scale-[0.98] sm:px-8"
            >
              Explorar el catálogo <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/#el-local"
              className="inline-flex items-center justify-center gap-2 border border-pava-cream/40 bg-pava-brown/10 px-7 py-4 text-sm font-semibold tracking-wide text-pava-cream backdrop-blur-[2px] transition-all duration-200 hover:border-pava-cream hover:bg-pava-cream/10"
            >
              Conocé nuestro local
            </Link>
          </div>
        </div>

        <div className="animate-fade-in animate-delay-600 mt-12 flex items-center gap-4 border-t border-pava-cream/20 pt-4 text-[10px] font-medium uppercase tracking-[0.18em] text-pava-cream/55 sm:mt-16 sm:max-w-md">
          <span>Argentina</span>
          <span className="h-1 w-1 rounded-full bg-pava-gold" />
          <span>Yerbas · Mates · Accesorios</span>
        </div>
      </div>
    </section>
  );
}
