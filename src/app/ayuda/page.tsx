"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Truck,
  CreditCard,
  HelpCircle,
  RotateCcw,
  Sparkles,
  MessageCircle,
  ChevronDown,
  PackageCheck,
  MapPin,
  Clock,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { whatsappChatUrl } from "@/lib/whatsapp";

interface FAQItem {
  id: string;
  category: "envios" | "pagos" | "curado" | "garantia" | "personalizados";
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  // Envíos
  {
    id: "env-1",
    category: "envios",
    question: "¿Cómo realizan los envíos y cuánto demoran?",
    answer:
      "Despachamos a todo el país mediante Andreani y Correo Argentino con código de seguimiento en tiempo real. Los envíos suelen demorar entre 2 y 5 días hábiles según la provincia y localidad. En Catriel y zonas aledañas la entrega es en el día o retiro gratis en nuestro local.",
  },
  {
    id: "env-2",
    category: "envios",
    question: "¿Cómo hago el seguimiento de mi paquete?",
    answer:
      "Una vez despachado tu pedido, te enviamos el número de guía por WhatsApp o email. Además, podés ingresar a nuestra sección 'Seguimiento' en la web con tu número de pedido o teléfono para ver el estado en vivo.",
  },
  {
    id: "env-3",
    category: "envios",
    question: "¿Cómo se embalan los mates para que no se rompan?",
    answer:
      "Cada pieza se envuelve individualmente con varias capas de plástico de burbujas de alta densidad, papel kraft y se coloca en cajas reforzadas con relleno amortiguador para soportar cualquier impacto durante el viaje.",
  },
  // Pagos
  {
    id: "pag-1",
    category: "pagos",
    question: "¿Qué formas de pago aceptan y cómo funciona el 10% OFF?",
    answer:
      "Aceptamos Transferencia Bancaria (con 10% de descuento automático e inmediato sobre el total de productos), Mercado Pago (tarjetas de crédito, débito, dinero en cuenta) y efectivo al retirar en nuestro local de Catriel.",
  },
  {
    id: "pag-2",
    category: "pagos",
    question: "¿Cómo aplico los cupones de descuento o premios de la ruleta?",
    answer:
      "Al finalizar tu compra en el carrito o coordinar por WhatsApp, ingresás el código del cupón (por ejemplo el que ganaste en la Ruleta Matera) y se descontará del importe total.",
  },
  // Curado
  {
    id: "cur-1",
    category: "curado",
    question: "¿Cómo se cura un mate de calabaza por primera vez?",
    answer:
      "1. Enjuagá el interior con agua tibia (nunca hirviendo).\n2. Llenalo con yerba usada húmeda y agregale un chorrito de agua tibia.\n3. Dejalo reposar 24 horas y vacialo.\n4. Raspá suavemente las paredes interiores con una cuchara sopera para desprender el hollejo suelto.\n5. Repetí el proceso 2 veces más. ¡Listo para cebar!",
  },
  {
    id: "cur-2",
    category: "curado",
    question: "¿Los mates de acero térmico o vidrio necesitan curado?",
    answer:
      "No, los mates de acero inoxidable y vidrio no requieren ningún tipo de curado previo. Solo necesitás lavarlos con agua tibia y detergente suave antes del primer uso.",
  },
  {
    id: "cur-3",
    category: "curado",
    question: "¿Cómo evitar que mi mate de calabaza junte hongos?",
    answer:
      "El secreto está en el secado: nunca dejes el mate con yerba usada por más de 24 horas. Al lavarlo, escurrilo y secalo boca arriba o inclinado en un lugar ventilado e iluminado (nunca tapado ni boca abajo sobre una servilleta húmeda).",
  },
  // Garantía
  {
    id: "gar-1",
    category: "garantia",
    question: "¿Qué garantía tienen los productos y qué pasa si llega roto?",
    answer:
      "Todos nuestros productos cuentan con garantía de satisfacción y calidad artesanal. Si el producto sufre algún daño durante el transporte por el correo, nos contactás por WhatsApp el mismo día de recibido con una foto y te enviamos un reemplazo sin costo adicional.",
  },
  {
    id: "gar-2",
    category: "garantia",
    question: "¿Puedo cambiar el mate si no era el tamaño que esperaba?",
    answer:
      "Sí, tenés 30 días para realizar cambios de productos que no hayan sido curados ni utilizados, conservando su empaque original.",
  },
  // Regalos
  {
    id: "per-1",
    category: "personalizados",
    question: "¿Puedo enviar un pedido como regalo con dedicatoria?",
    answer:
      "¡Sí! En el carrito de compras podés tildar la opción '¿Es para regalo?' y escribir tu dedicatoria personalizada. La imprimiremos en una tarjeta kraft artesanal sin ningún costo adicional.",
  },
  {
    id: "per-2",
    category: "personalizados",
    question: "¿Realizan regalos empresariales o ventas corporativas?",
    answer:
      "Sí, armamos cajas de regalo personalizadas con termos, mates y yerbas seleccionadas. Escribinos directamente por WhatsApp para solicitar cotización y asesoramiento corporativo.",
  },
];

const CATEGORIES = [
  { id: "all", label: "Todas las preguntas", icon: HelpCircle },
  { id: "envios", label: "Envíos y Entregas", icon: Truck },
  { id: "pagos", label: "Pagos y Descuentos", icon: CreditCard },
  { id: "curado", label: "Curado y Cuidado", icon: Sparkles },
  { id: "garantia", label: "Garantía y Cambios", icon: RotateCcw },
  { id: "personalizados", label: "Regalos y Dedicatorias", icon: PackageCheck },
];

export default function HelpCenterPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openIds, setOpenIds] = useState<string[]>(["env-1", "pag-1", "cur-1"]);
  const settings = useSiteSettings();

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const filteredFaqs = useMemo(() => {
    const q = search.toLowerCase().trim();
    return FAQS.filter((faq) => {
      const matchesCategory =
        activeCategory === "all" || faq.category === activeCategory;
      const matchesSearch =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-pava-cream">
      <PageHeader
        eyebrow="Centro de Soporte"
        title="Centro de Ayuda y Guías"
        description="Todo lo que necesitás saber sobre envíos, pagos, curado de mates, garantías y atención personalizada."
      />

      <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10 lg:py-16">
        {/* Live Search Bar */}
        <div className="relative mb-10">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-pava-brown/40"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscá tu duda: ej: 'curar mate', 'cuánto demora el envío', 'transferencia'..."
            className="w-full rounded-2xl border border-pava-brown/15 bg-white pl-12 pr-4 py-4 text-sm text-pava-brown placeholder:text-pava-brown/40 shadow-sm focus:border-pava-green focus:outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-pava-brown/40 hover:text-pava-brown"
            >
              Borrar
            </button>
          )}
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-2.5 mb-10">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-pava-green text-pava-cream shadow-md"
                    : "border border-pava-brown/12 bg-white text-pava-brown hover:border-pava-brown/25"
                }`}
              >
                <Icon size={15} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5 mb-16">
          {filteredFaqs.length === 0 ? (
            <div className="rounded-3xl border border-pava-brown/10 bg-white/70 p-10 text-center">
              <p className="text-sm font-semibold text-pava-brown">
                No encontramos preguntas que coincidan con &quot;{search}&quot;
              </p>
              <p className="text-xs text-pava-brown-mid/70 mt-1 mb-4">
                ¡Escribinos directamente por WhatsApp y te asesoramos al instante!
              </p>
              <a
                href={whatsappChatUrl(
                  settings.whatsappNumber,
                  `Hola! Tengo una consulta sobre: ${search}`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-control bg-whatsapp px-5 py-2.5 text-xs font-bold text-white hover:bg-whatsapp-dark transition-colors"
              >
                <MessageCircle size={14} />
                <span>Preguntar por WhatsApp</span>
              </a>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id);

              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-pava-brown/10 bg-white overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-pava-cream/30"
                  >
                    <span className="font-display text-sm sm:text-base font-bold text-pava-brown pr-4">
                      {faq.question}
                    </span>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pava-cream text-pava-brown transition-transform duration-200 ${
                        isOpen ? "rotate-180 bg-pava-green/15 text-pava-green" : ""
                      }`}
                    >
                      <ChevronDown size={16} />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-pava-brown-mid/85 leading-relaxed border-t border-pava-brown/5 whitespace-pre-line animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact WhatsApp Cards Banner */}
        <div className="rounded-3xl border border-pava-brown/12 bg-white p-6 sm:p-8 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-pava-green block mb-1">
              Atención Directa
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-pava-brown">
              ¿No encontraste lo que buscabas?
            </h3>
            <p className="text-xs text-pava-brown-mid/75 mt-1">
              Estamos en línea para responder tus preguntas y armar tu pedido a medida.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href={whatsappChatUrl(
                settings.whatsappNumber,
                "Hola Poné La Pava! Quiero consultar por asesoramiento para elegir mi primer mate.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col justify-between rounded-2xl border border-pava-brown/10 bg-pava-cream/40 p-4.5 hover:border-pava-green/30 hover:bg-pava-cream transition-all group"
            >
              <div>
                <MessageCircle size={18} className="text-whatsapp mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-display text-xs font-bold text-pava-brown">Asesoramiento de Compra</h4>
                <p className="text-[11px] text-pava-brown-mid/70 mt-1">Te ayudamos a elegir mate, yerba o termo ideal.</p>
              </div>
              <span className="text-[11px] font-bold text-pava-green mt-3 flex items-center gap-1">
                Escribir por WhatsApp →
              </span>
            </a>

            <a
              href={whatsappChatUrl(
                settings.whatsappNumber,
                "Hola! Quiero consultar por un presupuesto para Regalos Empresariales / Corporativos.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col justify-between rounded-2xl border border-pava-brown/10 bg-pava-cream/40 p-4.5 hover:border-pava-green/30 hover:bg-pava-cream transition-all group"
            >
              <div>
                <PackageCheck size={18} className="text-pava-gold mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-display text-xs font-bold text-pava-brown">Regalos Empresariales</h4>
                <p className="text-[11px] text-pava-brown-mid/70 mt-1">Kits corporativos grabados con logo y factura.</p>
              </div>
              <span className="text-[11px] font-bold text-pava-green mt-3 flex items-center gap-1">
                Pedir cotización →
              </span>
            </a>

            <div className="flex flex-col justify-between rounded-2xl border border-pava-brown/10 bg-pava-cream/40 p-4.5">
              <div>
                <MapPin size={18} className="text-pava-terracotta mb-2" />
                <h4 className="font-display text-xs font-bold text-pava-brown">Local en Catriel</h4>
                <p className="text-[11px] text-pava-brown-mid/70 mt-1">San Martín 374, Catriel, Río Negro.</p>
              </div>
              <span className="text-[11px] font-semibold text-pava-brown-mid/80 mt-3 flex items-center gap-1">
                <Clock size={12} /> {settings.hoursWeekday}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
