"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle, CreditCard, Truck, Sparkles, ShieldCheck } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { whatsappChatUrl } from "@/lib/whatsapp";
import { useSiteSettings } from "@/context/SiteSettingsContext";

interface FAQItem {
  category: "pagos" | "envios" | "curado" | "garantia";
  question: string;
  answer: string;
}

const CATEGORIES = [
  { id: "all", label: "Todas las dudas", icon: HelpCircle },
  { id: "pagos", label: "Pagos & 3 Cuotas", icon: CreditCard },
  { id: "envios", label: "Envíos & Retiro", icon: Truck },
  { id: "curado", label: "Curado & Mates", icon: Sparkles },
  { id: "garantia", label: "Garantía & Local", icon: ShieldCheck },
] as const;

const FAQS: FAQItem[] = [
  {
    category: "pagos",
    question: "¿Qué medios de pago aceptan y cómo obtengo el 10% OFF?",
    answer:
      "Aceptamos tarjetas de crédito en hasta 3 cuotas sin interés, tarjetas de débito, Mercado Pago y transferencia bancaria. Si elegís pagar por transferencia bancaria o en efectivo en nuestro local, ¡accedés a un 10% de descuento automático acumulable con tu compra!",
  },
  {
    category: "pagos",
    question: "¿Cómo es el proceso de compra directa por WhatsApp?",
    answer:
      "Armás tu carrito en la web con los productos que desees y hacés clic en 'Pedir por WhatsApp'. El sistema genera automáticamente el detalle de tu compra y te atiende una persona del local para confirmar stock, pasarte los datos de pago y despacharlo en el día.",
  },
  {
    category: "envios",
    question: "¿Hacen envíos a todo el país y cuánto tardan?",
    answer:
      "¡Sí! Despachamos a toda la Argentina a través de Correo Argentino y Andreani. Los envíos suelen demorar entre 2 y 5 días hábiles según la localidad. Además, para compras superiores a $65.000, el envío es 100% gratuito.",
  },
  {
    category: "envios",
    question: "¿Puedo retirar mi compra sin cargo en el local de Catriel?",
    answer:
      "¡Claro que sí! Podés seleccionar 'Retiro en el local' y buscar tu pedido por Av. San Martín 374, Catriel (Río Negro). Tu pedido queda preparado en menos de 1 hora para retirar en nuestro horario comercial.",
  },
  {
    category: "curado",
    question: "¿Cómo se cura un mate nuevo de calabaza o algarrobo?",
    answer:
      "Llená el mate con yerba húmeda usada y un chorrito de agua tibia (a 75°C). Dejalo reposar 24 hs, vacialo y raspá suavemente las paredes interiores con una cuchara para desprender el hollejo suelto. Repetí este paso 2 veces. ¡Listo para cebar!",
  },
  {
    category: "curado",
    question: "¿Los mates de acero inoxidable o cerámica necesitan curado?",
    answer:
      "No, los mates de acero inoxidable, cerámica o vidrio no requieren curado previo. Solo necesitan un lavado inicial con agua tibia y ya están listos para disfrutar de la primera ronda.",
  },
  {
    category: "garantia",
    question: "¿Qué garantía tienen los termos y mates artesanales?",
    answer:
      "Todos nuestros mates de calabaza y cuero cuentan con garantía artesanal sobre costuras y virolas de alpaca. Los termos Stanley y Lumilagro cuentan con garantía oficial de rendimiento térmico. Te asesoramos siempre ante cualquier consulta.",
  },
];

export default function FAQSection() {
  const [activeCat, setActiveCat] = useState<string>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const settings = useSiteSettings();

  const filteredFaqs = activeCat === "all" ? FAQS : FAQS.filter((f) => f.category === activeCat);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section
      id="preguntas-frecuentes"
      className="bg-pava-cream-dark/40 py-24 sm:py-28 lg:py-32 border-t border-pava-brown/8"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <ScrollReveal direction="up" className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-pava-brown/15 bg-white/80 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-pava-gold-deep mb-4 shadow-xs">
            <HelpCircle size={14} />
            Dudas frecuentes
          </div>
          <h2 className="font-display text-4xl font-bold tracking-tight text-pava-brown sm:text-5xl">
            Todo lo que necesitás saber
          </h2>
          <p className="mt-3 text-sm text-pava-brown-mid/75 max-w-xl mx-auto leading-relaxed">
            Respuestas a las preguntas más habituales sobre compras, 3 cuotas, envíos y cuidados de tus piezas.
          </p>
        </ScrollReveal>

        {/* Category Tabs */}
        <ScrollReveal direction="up" delay={50} className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCat === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCat(cat.id);
                  setOpenIndex(0);
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-pava-green text-white shadow-md scale-105"
                    : "bg-white/80 text-pava-brown border border-pava-brown/12 hover:bg-pava-cream-dark hover:border-pava-gold"
                }`}
              >
                <Icon size={13} className={isActive ? "text-pava-gold" : "text-pava-brown/60"} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </ScrollReveal>

        {/* Accordion list */}
        <div className="space-y-3.5">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <ScrollReveal
                key={faq.question}
                direction="up"
                delay={index * 40}
                className="overflow-hidden rounded-2xl border border-pava-brown/10 bg-white shadow-xs transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left transition-colors hover:bg-pava-cream/20 cursor-pointer"
                >
                  <span className="font-display text-base sm:text-lg font-bold text-pava-brown">
                    {faq.question}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-pava-green text-pava-cream shadow-xs" : "bg-pava-brown/5 text-pava-brown"
                    }`}
                  >
                    <ChevronDown size={16} />
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-pava-brown/8 px-5 pb-6 pt-4 sm:px-6 sm:pb-7 bg-pava-cream/10">
                    <p className="text-sm leading-relaxed text-pava-brown-mid/85">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </ScrollReveal>
            );
          })}
        </div>

        {/* Support banner */}
        <ScrollReveal
          direction="up"
          delay={200}
          className="mt-12 rounded-2xl border border-pava-green/20 bg-pava-green/5 p-6 text-center sm:p-8 backdrop-blur-xs"
        >
          <h3 className="font-display text-xl font-bold text-pava-brown mb-2">
            ¿Tenés alguna consulta específica?
          </h3>
          <p className="text-xs sm:text-sm text-pava-brown-mid/75 mb-6 max-w-md mx-auto">
            Estamos disponibles por WhatsApp para responderte en minutos y ayudarte a elegir tu mate o yerba ideal.
          </p>
          <a
            href={whatsappChatUrl(
              settings.whatsappNumber,
              "¡Hola Poné La Pava! Tengo una consulta sobre sus productos 🧉",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-control bg-whatsapp px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:bg-whatsapp-dark active:scale-[0.98]"
          >
            <MessageCircle size={16} />
            Consultar por WhatsApp
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
