"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { whatsappChatUrl } from "@/lib/whatsapp";
import { useSiteSettings } from "@/context/SiteSettingsContext";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "¿Cómo se realiza la compra y el pago?",
    answer:
      "Podés armar tu pedido directamente en el carrito de la web y enviarlo por WhatsApp con un solo clic. Allí te confirmamos disponibilidad inmediata y coordinamos el pago por transferencia bancaria, tarjetas de crédito/débito o en efectivo si retirás en el local.",
  },
  {
    question: "¿Hacen envíos a todo el país?",
    answer:
      "¡Sí! Realizamos envíos seguros a toda la Argentina a través de Correo Argentino y transportes expresos de confianza. Además, para compras que superen los $65.000, ¡el envío es totalmente bonificado!",
  },
  {
    question: "¿Puedo retirar mi pedido personalmente?",
    answer:
      "¡Por supuesto! Podés retirar tu compra sin costo adicional en nuestro local de Catriel. Te avisamos por WhatsApp en cuanto tu paquete esté listo.",
  },
  {
    question: "¿Cómo curo un mate nuevo de calabaza o madera?",
    answer:
      "Para calabaza o madera: llená el mate con yerba usada húmeda y un chorrito de agua tibia. Dejalo reposar 24 horas, raspá suavemente las paredes interiores con una cuchara para retirar restos de hollejo y repetí el proceso 2 o 3 veces antes del primer uso.",
  },
  {
    question: "¿Necesito ayuda para elegir mi primer mate o yerba?",
    answer:
      "Te asesoramos con gusto según tus gustos personales (yerbas suaves, intensas, despaladas o compuestas; mates torpedo, camionero o térmicos). Podés usar nuestro interactivo 'Mate Matcher' o escribirnos por WhatsApp.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const settings = useSiteSettings();

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
        <ScrollReveal direction="up" className="text-center mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-pava-brown/15 bg-white/70 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-pava-gold-deep mb-4">
            <HelpCircle size={14} />
            Dudas frecuentes
          </div>
          <h2 className="font-display text-4xl font-bold tracking-tight text-pava-brown sm:text-5xl">
            Todo lo que necesitás saber
          </h2>
          <p className="mt-4 text-sm text-pava-brown-mid/75 max-w-xl mx-auto leading-relaxed">
            Respuestas a las preguntas más comunes sobre compras, envíos, cuidados de tus mates y atención personalizada.
          </p>
        </ScrollReveal>

        {/* Accordion list */}
        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <ScrollReveal
                key={faq.question}
                direction="up"
                delay={index * 50}
                className="overflow-hidden rounded-card border border-pava-brown/10 bg-white shadow-sm transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left transition-colors hover:bg-pava-cream/20"
                >
                  <span className="font-display text-base sm:text-lg font-bold text-pava-brown">
                    {faq.question}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pava-brown/5 text-pava-brown transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-pava-green text-pava-cream" : ""
                    }`}
                  >
                    <ChevronDown size={16} />
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-pava-brown/8 px-5 pb-6 pt-4 sm:px-6 sm:pb-7">
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
          delay={250}
          className="mt-12 rounded-card border border-pava-green/20 bg-pava-green/5 p-6 text-center sm:p-8"
        >
          <h3 className="font-display text-xl font-bold text-pava-brown mb-2">
            ¿Tenés alguna otra consulta?
          </h3>
          <p className="text-xs sm:text-sm text-pava-brown-mid/75 mb-6 max-w-md mx-auto">
            Estamos del otro lado para responder todas tus dudas sobre productos o ayudarte a armar tu equipo matero ideal.
          </p>
          <a
            href={whatsappChatUrl(
              settings.whatsappNumber,
              "Hola! Tengo una consulta sobre los productos de Poné La Pava."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-control bg-whatsapp px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-sm transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageCircle size={17} />
            Escribinos por WhatsApp
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
