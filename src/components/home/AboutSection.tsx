import Image from "next/image";

export default function AboutSection() {
  return (
    <section
      id="nosotros"
      className="overflow-hidden bg-pava-cream py-20 sm:py-24 lg:py-32"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-24">
          {/* Text */}
          <div className="order-2 lg:order-1">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-pava-terracotta" />
              <span className="text-xs tracking-[0.2em] uppercase text-pava-terracotta font-medium">
                Nosotros
              </span>
            </div>
            <h2 className="font-display mb-7 text-4xl font-bold leading-[0.98] tracking-tight text-pava-brown sm:text-5xl lg:text-6xl">
              Más que una yerba.{" "}
              <em className="not-italic text-pava-terracotta">
                Una forma de compartir.
              </em>
            </h2>
            <div className="max-w-xl space-y-4 text-pava-brown-mid/75 leading-relaxed">
              <p>
                En Poné La Pava creemos que el mate no es solo una bebida: es
                un ritual, un pretexto para estar juntos, para bajar el ritmo
                y conectar.
              </p>
              <p>
                Nacimos con la misión de reunir todo lo que necesitás para vivir
                ese ritual como se merece. Desde la yerba más cuidadosamente
                seleccionada hasta el mate que se convierte en tuyo con el
                tiempo.
              </p>
              <p>
                Cada producto que ofrecemos fue elegido con criterio, porque
                sabemos que detrás de cada mate hay una historia.
              </p>
            </div>

            {/* Values */}
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-pava-brown/10 pt-7 sm:grid-cols-4">
              {[
                { value: "100%", label: "Artesanal" },
                { value: "Premium", label: "Selección" },
                { value: "Local", label: "Argentino" },
                { value: "Ritual", label: "Matero" },
              ].map(({ value, label }) => (
                <div key={label} className="border-l-2 border-pava-terracotta pl-4">
                  <div className="font-display text-2xl font-bold text-pava-brown">
                    {value}
                  </div>
                  <div className="text-xs tracking-[0.15em] uppercase text-pava-brown-mid/60 mt-0.5">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative order-1 lg:order-2">
            <div className="relative aspect-[4/5] overflow-hidden bg-pava-brown">
              <Image
                src="/about_section_1786546070863.png"
                alt="Compartiendo mate — Poné La Pava"
                fill
                className="object-cover transition-transform duration-700 hover:scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Accent decoration */}
            <div className="absolute bottom-4 left-4 border border-pava-cream/30 bg-pava-brown/75 px-4 py-3 text-pava-cream backdrop-blur-sm sm:bottom-6 sm:left-6">
              <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-pava-gold">Desde Argentina</span>
              <span className="mt-1 block font-display text-lg font-bold">Para cada ronda</span>
            </div>
            <div className="absolute -bottom-6 -left-6 -z-10 hidden h-32 w-32 bg-pava-terracotta/10 lg:block" />
            <div className="absolute -right-6 -top-6 -z-10 hidden h-20 w-20 bg-pava-gold/15 lg:block" />
          </div>
        </div>
      </div>
    </section>
  );
}
