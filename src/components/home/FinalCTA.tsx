"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, ShoppingBag, Copy, Check, Sparkles, CreditCard, ShieldCheck } from "lucide-react";
import { whatsappChatUrl } from "@/lib/whatsapp";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import MagneticButton from "@/components/ui/MagneticButton";
import FinalCTABackground from "./FinalCTABackground";
import { BorderBeam } from "@/components/ui/BorderBeam";

export default function FinalCTA() {
  const settings = useSiteSettings();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText("TRANSFERENCIA10");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="grain-overlay relative overflow-hidden bg-pava-brown py-24 sm:py-28 lg:py-36 text-pava-cream border-t border-pava-cream/10">
      <FinalCTABackground />

      {/* Ambient glowing circles */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-pava-gold/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-pava-green/20 blur-[90px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Main CTA Left */}
          <div className="lg:col-span-7">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-pava-gold" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-pava-gold">
                Tu próximo mate empieza acá
              </span>
            </div>
            
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[0.92] tracking-tight text-pava-cream">
              ¿Listo para renovar <br />
              <em className="text-shine not-italic text-pava-gold">tu ritual diario?</em>
            </h2>
            
            <p className="mt-6 max-w-xl text-sm sm:text-base leading-relaxed text-pava-cream/80">
              Yerbas seleccionadas, mates de calabaza brasilera con virola de alpaca y accesorios duraderos. Hacé tu pedido online en minutos con atención personalizada.
            </p>

            <div className="mt-9 flex flex-col gap-3.5 sm:flex-row sm:gap-4">
              <MagneticButton>
                <Link
                  href="/catalogo"
                  className="cta-pulse-ring inline-flex items-center justify-center gap-3 rounded-control bg-pava-gold px-8 py-4 text-sm font-bold tracking-wide text-pava-brown shadow-xl shadow-pava-gold/15 transition-all duration-200 hover:bg-pava-gold-light active:scale-[0.98]"
                >
                  <ShoppingBag size={18} />
                  <span>Explorar Catálogo Completo</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </MagneticButton>

              <MagneticButton>
                <a
                  href={whatsappChatUrl(settings.whatsappNumber, "¡Hola! Quiero consultar por productos y envíos.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 rounded-control border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold tracking-wide text-pava-cream backdrop-blur-md transition-all duration-200 hover:border-whatsapp hover:bg-whatsapp hover:text-white hover:shadow-lg hover:shadow-whatsapp/20"
                >
                  <MessageCircle size={18} />
                  <span>Asesoramiento por WhatsApp</span>
                </a>
              </MagneticButton>
            </div>
          </div>

          {/* Exclusive Promo Card Right */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-pava-gold/40 bg-pava-green-dark/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
              <BorderBeam
                size={280}
                duration={10}
                borderWidth={1.5}
                colorFrom="#d39e4a"
                colorTo="transparent"
              />

              <div className="flex items-center gap-2.5 mb-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pava-gold/20 text-pava-gold">
                  <CreditCard size={15} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-pava-gold">
                  Beneficio Exclusivo
                </span>
              </div>

              <h3 className="font-display text-2xl font-bold text-pava-cream">
                10% OFF EXTRA <br />
                <span className="text-pava-gold font-normal text-lg">con Transferencia Bancaria</span>
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-pava-cream/75">
                Acumulable con precios de lista y combos especiales. Copiá el cupón o pedilo directo al cerrar tu pedido por WhatsApp.
              </p>

              {/* Coupon Box */}
              <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-dashed border-pava-gold/50 bg-black/30 p-3.5">
                <div className="font-mono text-sm sm:text-base font-bold tracking-widest text-pava-gold">
                  TRANSFERENCIA10
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-pava-gold px-3.5 py-1.5 text-xs font-bold text-pava-brown hover:bg-pava-gold-light active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Badges footer */}
              <div className="mt-6 pt-4 border-t border-pava-cream/10 flex items-center justify-between text-[11px] text-pava-cream/70">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-pava-gold" />
                  Compra 100% segura
                </span>
                <span>🚚 Envíos a todo el país</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
