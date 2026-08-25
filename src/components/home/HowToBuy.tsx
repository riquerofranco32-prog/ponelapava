import Link from "next/link";
import {
  ShoppingBag,
  ClipboardList,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const steps = [
  {
    icon: ShoppingBag,
    title: "Elegí tus productos",
    description:
      "Navegá nuestro catálogo y encontrá yerbas seleccionadas, mates, termos y accesorios.",
    badge: "Catálogo online",
  },
  {
    icon: ClipboardList,
    title: "Armá tu pedido",
    description: "Agregá todo a tu carrito con un clic y revisá tu selección cuando quieras.",
    badge: "Sin registros",
  },
  {
    icon: MessageCircle,
    title: "Enviános por WhatsApp",
    description:
      "Tu lista se convierte en un mensaje automático listo para mandar a nuestro local.",
    badge: "1 Clic",
  },
  {
    icon: CheckCircle2,
    title: "Coordinamos entrega",
    description: "Acordamos envío a todo el país o retiro inmediato en nuestro local en Catriel.",
    badge: "Rápido y seguro",
  },
];

export default function HowToBuy() {
  return (
    <section id="como-comprar" className="bg-pava-green py-24 sm:py-28 lg:py-36 border-b border-pava-cream/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <ScrollReveal direction="up" className="mb-16 lg:mb-20 max-w-2xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-9 bg-pava-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-gold">
              Experiencia simple
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold leading-[0.93] tracking-tight text-pava-cream sm:text-5xl lg:text-6xl">
            En cuatro pasos,
            <br />
            <em className="not-italic text-pava-gold">tu mate en camino.</em>
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-pava-cream/75 max-w-md">
            Comprás directo por WhatsApp con atención humana. Sin formularios eternos, sin complicaciones.
          </p>
        </ScrollReveal>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <ScrollReveal
              key={step.title}
              direction="up"
              delay={index * 80}
              className="group relative flex flex-col justify-between rounded-card border border-pava-cream/15 bg-pava-green-dark/40 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-pava-gold/50 hover:bg-pava-green-dark/70 hover:shadow-xl hover:shadow-black/20"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="relative flex h-13 w-13 items-center justify-center rounded-control border border-pava-gold/40 bg-pava-green-dark text-pava-gold transition-colors duration-300 group-hover:border-pava-gold group-hover:bg-pava-gold group-hover:text-pava-brown shadow-md">
                    <step.icon size={22} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span
                    aria-hidden="true"
                    className="font-display text-4xl font-extrabold leading-none text-pava-gold/20 transition-colors duration-300 group-hover:text-pava-gold/40"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="inline-block rounded-chip border border-pava-gold/30 bg-pava-gold/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-pava-gold">
                    {step.badge}
                  </span>
                </div>

                <h3 className="font-display mb-2 text-xl font-bold text-pava-cream">
                  {step.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-pava-cream/75">
                  {step.description}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-pava-gold/40">
                  <ArrowRight size={16} />
                </div>
              )}
            </ScrollReveal>
          ))}
        </div>

        {/* CTA */}
        <ScrollReveal direction="up" delay={200} className="mt-14 lg:mt-18 text-center sm:text-left">
          <Link
            href="/catalogo"
            id="howtobuy-cta"
            className="inline-flex items-center gap-3 rounded-control border-2 border-pava-gold bg-pava-gold px-10 py-4 text-sm font-bold tracking-wide text-pava-brown shadow-lg shadow-pava-gold/10 transition-all duration-200 hover:bg-pava-gold-light hover:border-pava-gold-light active:scale-[0.98]"
          >
            Empezar a elegir productos <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
