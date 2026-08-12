import Image from "next/image";

export default function AboutSection() {
  return (
    <section
      id="nosotros"
      className="py-20 lg:py-32 bg-pava-cream overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text */}
          <div className="order-2 lg:order-1">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-pava-terracotta" />
              <span className="text-xs tracking-[0.2em] uppercase text-pava-terracotta font-medium">
                Nosotros
              </span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-pava-brown leading-tight mb-6">
              Más que una yerba.{" "}
              <em className="not-italic text-pava-terracotta">
                Una forma de compartir.
              </em>
            </h2>
            <div className="space-y-4 text-pava-brown-mid/75 leading-relaxed">
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
            <div className="grid grid-cols-2 gap-6 mt-10">
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
          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/about_section_1786546070863.png"
                alt="Compartiendo mate — Poné La Pava"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Accent decoration */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-pava-terracotta/10 -z-10 hidden lg:block" />
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-pava-gold/15 -z-10 hidden lg:block" />
          </div>
        </div>
      </div>
    </section>
  );
}
