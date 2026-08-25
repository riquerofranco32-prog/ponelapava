import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function AboutSection() {
  return (
    <section
      id="nosotros"
      className="overflow-hidden bg-pava-cream py-24 sm:py-28 lg:py-36"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Image column — full height, editorial */}
          <ScrollReveal
            direction="left"
            className="relative order-1 lg:order-1"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-pava-brown lg:aspect-auto lg:h-full lg:min-h-[580px]">
              <Image
                src="/local/local-1.jpg"
                alt="Local Poné La Pava en Catriel, Río Negro"
                fill
                className="object-cover transition-transform duration-700 hover:scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Subtle dark overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-pava-brown/20" />
            </div>

            {/* Floating card */}
            <div className="absolute bottom-5 right-0 translate-x-4 border border-pava-cream/30 bg-pava-brown/80 px-5 py-4 text-pava-cream backdrop-blur-sm sm:bottom-8 sm:translate-x-6 lg:translate-x-8">
              <span className="block text-[9px] font-semibold uppercase tracking-[0.22em] text-pava-gold">
                Desde Argentina
              </span>
              <span className="mt-1 block font-display text-lg font-bold">
                Para cada ronda
              </span>
            </div>

            {/* Background geometry — desktop only */}
            <div
              className="absolute -bottom-6 -left-5 -z-10 hidden h-40 w-40 bg-pava-terracotta/8 lg:block"
              aria-hidden="true"
            />
            <div
              className="absolute -right-5 -top-5 -z-10 hidden h-24 w-24 bg-pava-olive/15 lg:block"
              aria-hidden="true"
            />
          </ScrollReveal>

          {/* Text column */}
          <ScrollReveal
            direction="right"
            delay={120}
            className="order-2 flex flex-col justify-center lg:order-2"
          >
            {/* Label */}
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-8 bg-pava-terracotta" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-pava-terracotta">
                Nosotros
              </span>
            </div>

            {/* Headline */}
            <h2 className="font-display mb-8 text-4xl font-bold leading-[0.96] tracking-tight text-pava-brown sm:text-5xl lg:text-[3.25rem]">
              Más que una yerba.{" "}
              <em className="not-italic text-pava-terracotta">
                Una forma de compartir.
              </em>
            </h2>

            {/* Pull quote — oversized quotation mark instead of a template-style border accent */}
            <div className="relative mb-7">
              <span
                aria-hidden="true"
                className="font-display pointer-events-none absolute -left-2 -top-6 select-none text-[5.5rem] leading-none text-pava-gold/20 sm:-top-8 sm:text-[7rem]"
              >
                &ldquo;
              </span>
              <p className="font-script relative pl-6 text-3xl leading-snug text-pava-brown-mid/85 sm:pl-8 sm:text-4xl">
                El mate no se toma solo. Y tampoco se elige solo.
              </p>
            </div>

            {/* Body text */}
            <div className="space-y-4 text-[15px] leading-relaxed text-pava-brown-mid/75">
              <p>
                En Poné La Pava creemos que el mate no es solo una bebida: es un
                ritual, un pretexto para estar juntos, para bajar el ritmo y
                conectar.
              </p>
              <p>
                Nacimos con la misión de reunir todo lo que necesitás para vivir
                ese ritual como se merece. Desde la yerba más cuidadosamente
                seleccionada hasta el mate que se convierte en tuyo con el
                tiempo.
              </p>
            </div>

            {/* Stats — divided bar, echoes the thin-rule language used in the Hero */}
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-6 border-t border-pava-brown/8 pt-8">
              {[
                { value: "100%", label: "Artesanal" },
                { value: "Premium", label: "Selección" },
                { value: "Local", label: "Argentino" },
                { value: "Ritual", label: "Compartido" },
              ].map(({ value, label }, i) => (
                <div key={label} className="flex items-center gap-8">
                  <div>
                    <div className="font-display text-2xl font-bold text-pava-brown">
                      {value}
                    </div>
                    <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-pava-brown-mid/75">
                      {label}
                    </div>
                  </div>
                  {i < 3 && (
                    <span
                      className="hidden h-9 w-px bg-pava-brown/12 sm:block"
                      aria-hidden="true"
                    />
                  )}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
