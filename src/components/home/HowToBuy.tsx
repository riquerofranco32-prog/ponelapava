const steps = [
  {
    number: "01",
    title: "Elegí tus productos",
    description:
      "Navegá nuestro catálogo y encontrá las yerbas, mates, termos y accesorios que más te gustan.",
    icon: "🌿",
  },
  {
    number: "02",
    title: "Armá tu pedido",
    description:
      "Agregá los productos al carrito y revisá tu selección antes de continuar.",
    icon: "🛒",
  },
  {
    number: "03",
    title: "Enviá por WhatsApp",
    description:
      "Con un clic se genera un mensaje con tu pedido completo listo para enviarnos.",
    icon: "💬",
  },
  {
    number: "04",
    title: "Coordinamos la entrega",
    description:
      "Acordamos la entrega o retiro en el local. Fácil, rápido y sin complicaciones.",
    icon: "📦",
  },
];

export default function HowToBuy() {
  return (
    <section
      id="como-comprar"
      className="py-20 lg:py-28 bg-pava-cream"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14 lg:mb-20 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-px bg-pava-green" />
            <span className="text-xs tracking-[0.2em] uppercase text-pava-green font-medium">
              Proceso
            </span>
            <span className="w-8 h-px bg-pava-green" />
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-pava-brown">
            ¿Cómo comprás?
          </h2>
          <p className="mt-4 text-pava-brown-mid/70 max-w-md mx-auto">
            Simple, rápido y sin registrarte. Todo por WhatsApp.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {/* Connector line (desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-pava-brown/10 z-0 -translate-y-1/2" />
              )}

              <div className="relative z-10">
                {/* Number + icon */}
                <div className="flex items-center gap-4 mb-5">
                  <span className="font-display text-5xl font-bold text-pava-brown/10 leading-none">
                    {step.number}
                  </span>
                  <span className="text-3xl">{step.icon}</span>
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold text-pava-brown mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-pava-brown-mid/70 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 lg:mt-20 text-center">
          <a
            href="/catalogo"
            className="inline-flex items-center gap-3 px-10 py-4 bg-transparent text-pava-green text-sm font-semibold tracking-wide border-2 border-pava-green hover:bg-pava-green hover:text-pava-cream transition-all duration-200 active:scale-[0.98]"
          >
            Empezar a elegir →
          </a>
        </div>
      </div>
    </section>
  );
}
