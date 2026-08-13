import Link from "next/link";
import {
  ShoppingBag,
  ClipboardList,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const steps = [
  {
    icon: ShoppingBag,
    title: "Elegí tus productos",
    description:
      "Navegá nuestro catálogo y encontrá yerbas, mates, termos y accesorios.",
  },
  {
    icon: ClipboardList,
    title: "Armá tu pedido",
    description: "Agregá los productos al carrito y revisá tu selección.",
  },
  {
    icon: MessageCircle,
    title: "Enviános por WhatsApp",
    description:
      "Con un clic se genera un mensaje con tu pedido listo para enviarnos.",
  },
  {
    icon: CheckCircle2,
    title: "Coordinamos",
    description: "Acordamos la entrega o retiro en el local. Sin vueltas.",
  },
];

export default function HowToBuy() {
  return (
    <section id="como-comprar" className="bg-pava-brown py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <ScrollReveal direction="up" className="mb-16 lg:mb-20 max-w-2xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-9 bg-pava-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-gold">
              Cómo comprar
            </span>
          </div>
          <h2 className="font-display text-4xl font-bold leading-[0.93] tracking-tight text-pava-cream sm:text-5xl lg:text-6xl">
            En cuatro pasos,
            <br />
            <em className="not-italic text-pava-gold">muy simple.</em>
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-pava-cream/65 max-w-md">
            Todo por WhatsApp. Sin formularios, sin cuentas, sin complicaciones.
          </p>
        </ScrollReveal>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map((step, index) => (
            <ScrollReveal key={step.title} direction="up" delay={index * 90}>
              <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-pava-gold/40 text-pava-gold">
                <step.icon size={24} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h3 className="font-display mb-2 text-xl font-bold text-pava-cream">
                {step.title}
              </h3>
              <p className="text-[14px] leading-relaxed text-pava-cream/65">
                {step.description}
              </p>
            </ScrollReveal>
          ))}
        </div>

        {/* CTA */}
        <ScrollReveal direction="up" delay={200} className="mt-14 lg:mt-18">
          <Link
            href="/catalogo"
            id="howtobuy-cta"
            className="inline-flex items-center gap-3 border-2 border-pava-gold bg-transparent px-10 py-4 text-sm font-semibold tracking-wide text-pava-gold transition-all duration-200 hover:bg-pava-gold hover:text-pava-brown active:scale-[0.98]"
          >
            Empezar a elegir <span aria-hidden="true">→</span>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
