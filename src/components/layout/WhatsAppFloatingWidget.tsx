"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Sparkles, MapPin, Truck, HelpCircle, Send } from "lucide-react";
import { whatsappChatUrl } from "@/lib/whatsapp";

interface WhatsAppFloatingWidgetProps {
  whatsappNumber: string;
}

interface QuickOption {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  desc: string;
  message: string;
}

const QUICK_OPTIONS: QuickOption[] = [
  {
    id: "custom",
    icon: Sparkles,
    title: "Armar set personalizado",
    desc: "Mates grabados, combos para regalo o empresas",
    message: "¡Hola Poné La Pava! 👋 Quisiera asesoramiento para armar un set matero personalizado / grabado.",
  },
  {
    id: "local",
    icon: MapPin,
    title: "Consultar local Catriel",
    desc: "Stock disponible en San Martín 245 y horarios",
    message: "¡Hola! 👋 Quería consultar stock disponible para retirar hoy en el local de Catriel.",
  },
  {
    id: "envios",
    icon: Truck,
    title: "Consulta sobre envíos",
    desc: "Costos y tiempos a tu ciudad o provincia",
    message: "¡Hola! 🚚 Quería consultar tiempos y costos de envío a mi localidad.",
  },
  {
    id: "general",
    icon: HelpCircle,
    title: "Otra consulta",
    desc: "Escribí tu mensaje libre a nuestro equipo",
    message: "¡Hola Poné La Pava! 👋 Tengo una consulta sobre los productos de la tienda online.",
  },
];

export default function WhatsAppFloatingWidget({
  whatsappNumber,
}: WhatsAppFloatingWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div
      ref={widgetRef}
      style={{
        bottom: "max(1.25rem, calc(env(safe-area-inset-bottom) + 0.75rem))",
        right: "max(1.25rem, calc(env(safe-area-inset-right) + 0.75rem))",
      }}
      className="fixed z-40 flex flex-col items-end"
    >
      {/* Popover Menu */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Atención por WhatsApp"
          className="mb-3 w-[calc(100vw-2.5rem)] max-w-sm rounded-2xl bg-white shadow-2xl border border-pava-brown/15 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
        >
          {/* Popover Header */}
          <div className="bg-[#26402e] text-pava-cream p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-whatsapp text-white shadow-inner">
                <MessageCircle size={22} />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 ring-2 ring-[#26402e]" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm tracking-wide text-white">
                  Poné La Pava — Atención
                </h3>
                <p className="text-[11px] text-pava-cream/80 flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Local Catriel • En línea
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-pava-cream hover:bg-white/20 transition-colors"
              aria-label="Cerrar menú WhatsApp"
            >
              <X size={16} />
            </button>
          </div>

          {/* Prompt banner */}
          <div className="bg-pava-cream/60 px-4 py-2.5 border-b border-pava-brown/10 text-[12px] text-pava-brown">
            ¿En qué te podemos ayudar hoy? Elegí una opción para chatear:
          </div>

          {/* Quick Options List */}
          <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
            {QUICK_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <a
                  key={opt.id}
                  href={whatsappChatUrl(whatsappNumber, opt.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-pava-cream/80 border border-transparent hover:border-pava-brown/15 transition-all text-left group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pava-green/10 text-pava-green group-hover:bg-pava-green group-hover:text-white transition-colors mt-0.5">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-pava-brown group-hover:text-pava-green flex items-center justify-between">
                      <span>{opt.title}</span>
                      <Send size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-whatsapp" />
                    </div>
                    <div className="text-[11px] text-pava-brown/70 line-clamp-1 mt-0.5">
                      {opt.desc}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Direct CTA */}
          <div className="p-3 bg-gray-50 border-t border-pava-brown/10 text-center">
            <a
              href={whatsappChatUrl(
                whatsappNumber,
                "¡Hola Poné La Pava! 👋 Quisiera hacer una consulta.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl bg-whatsapp hover:bg-[#20ba57] text-white text-xs font-bold shadow-md transition-transform active:scale-95"
            >
              <MessageCircle size={15} />
              Abrir chat directo
            </a>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Cerrar WhatsApp" : "Abrir opciones de WhatsApp"}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.65)] transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
      >
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-whatsapp animate-ping opacity-30 group-hover:opacity-0 pointer-events-none" />
        )}
        {isOpen ? (
          <X size={26} strokeWidth={2.4} />
        ) : (
          <MessageCircle size={26} strokeWidth={2.2} />
        )}
      </button>
    </div>
  );
}
