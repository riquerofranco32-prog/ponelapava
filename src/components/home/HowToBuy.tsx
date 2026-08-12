import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

const steps = [
  {
    number: "01",
    title: "Elegí",
    description:
      "Navegá nuestro catálogo y encontrá yerbas, mates, termos y accesorios.",
  },
  {
    number: "02",
    title: "Armá tu pedido",
    description:
      "Agregá los productos al carrito y revisá tu selección.",
  },
  {
    number: "03",
    title: "Mandalo por WhatsApp",
    description:
      "Con un clic se genera un mensaje con tu pedido listo para enviarnos.",
  },
  {
    number: "04",
    title: "Coordinamos",
    description:
      "Acordamos la entrega o retiro en el local. Sin vueltas.",
  },
];

export default function HowToBuy() {
  return (
    <section
      id="como-comprar"
      className="bg-pava-cream-dark py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

        {/* Header */}
        <ScrollReveal direction="up" className="mb-16 lg:mb-20 max-w-2xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-9 bg-pava-green" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-green">
              Proceso de compra
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold leading-[0.93] tracking-tight text-pava-brown sm:text-5xl lg:text-6xl">
            Simple, rápido<br />
            <em className="not-italic text-pava-green">y sin registro.</em>
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-pava-brown-mid/60 max-w-md">
            Todo por WhatsApp. Sin formularios, sin cuentas, sin complicaciones.
          </p>
        </ScrollReveal>

        {/* Steps */}
        <div className="relative grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <ScrollReveal
              key={step.number}
              direction="up"
              delay={index * 90}
              className="relative"
            >
              {/* Connector line — desktop only */}
              {index < steps.length - 1 && (
                <div
                  className="step-connector hidden lg:block"
                  aria-hidden="true"
                />
              )}

              <div className="border-t-2 border-pava-green/15 pt-8 pr-8 pb-8">
                {/* Number — decorative large */}
                <div
                  className="font-display mb-6 text-[5rem] font-bold leading-none tracking-tighter text-pava-green/10 select-none lg:text-[6rem]"
                  aria-hidden="true"
                >
                  {step.number}
                </div>

                <h3 className="font-display mb-3 text-2xl font-bold text-pava-brown">
                  {step.title}
                </h3>
                <p className="text-[14px] leading-relaxed text-pava-brown-mid/60">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* CTA */}
        <ScrollReveal direction="up" delay={200} className="mt-14 lg:mt-18">
          <Link
            href="/catalogo"
            id="howtobuy-cta"
            className="inline-flex items-center gap-3 border-2 border-pava-green bg-transparent px-10 py-4 text-sm font-semibold tracking-wide text-pava-green transition-all duration-200 hover:bg-pava-green hover:text-pava-cream active:scale-[0.98]"
          >
            Empezar a elegir <span aria-hidden="true">→</span>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
