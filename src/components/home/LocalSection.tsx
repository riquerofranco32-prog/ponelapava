import Image from "next/image";
import { MapPin, Clock, MessageCircle, ExternalLink } from "lucide-react";

export default function LocalSection() {
  return (
    <section
      id="el-local"
      className="py-20 lg:py-32 bg-pava-green text-pava-cream"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[5/4] overflow-hidden">
              <Image
                src="/local_store_1786546091007.png"
                alt="Local Poné La Pava"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Decoration */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-2 border-pava-gold/30 hidden lg:block" />
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-pava-gold" />
              <span className="text-xs tracking-[0.2em] uppercase text-pava-gold font-medium">
                El local
              </span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-pava-cream leading-tight mb-4">
              Visitanos y<br />
              <em className="not-italic text-pava-gold">tomá un mate</em>
            </h2>
            <p className="text-pava-cream/70 leading-relaxed mb-10">
              Nuestro local físico es el punto de encuentro de los mateadores.
              Venís, ves los productos, los tocás, los olés y te vas con lo
              que te enamoró.
            </p>

            {/* Details */}
            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-pava-cream/10 shrink-0">
                  <MapPin size={18} className="text-pava-gold" />
                </div>
                <div>
                  <div className="text-xs tracking-[0.15em] uppercase text-pava-cream/50 font-medium mb-1">
                    Dirección
                  </div>
                  {/* PLACEHOLDER: reemplazar con la dirección real */}
                  <p className="text-pava-cream font-medium">
                    Dirección a confirmar
                  </p>
                  <p className="text-pava-cream/60 text-sm">Argentina</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-pava-cream/10 shrink-0">
                  <Clock size={18} className="text-pava-gold" />
                </div>
                <div>
                  <div className="text-xs tracking-[0.15em] uppercase text-pava-cream/50 font-medium mb-1">
                    Horarios
                  </div>
                  {/* PLACEHOLDER: reemplazar con los horarios reales */}
                  <p className="text-pava-cream font-medium">Lun–Vie: 9:00 – 19:00 hs</p>
                  <p className="text-pava-cream/60 text-sm">Sábados: 9:00 – 14:00 hs</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-pava-cream/10 shrink-0">
                  <MessageCircle size={18} className="text-[#25D366]" />
                </div>
                <div>
                  <div className="text-xs tracking-[0.15em] uppercase text-pava-cream/50 font-medium mb-1">
                    WhatsApp
                  </div>
                  <a
                    href="https://wa.me/5491100000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pava-cream font-medium hover:text-[#25D366] transition-colors duration-200"
                  >
                    {/* PLACEHOLDER: reemplazar con el número real */}
                    +54 9 11 XXXX-XXXX
                  </a>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-pava-gold text-pava-brown text-sm font-semibold tracking-wide border-2 border-pava-gold hover:bg-pava-gold-light hover:border-pava-gold-light transition-all duration-200"
              >
                <ExternalLink size={15} />
                Cómo llegar
              </a>
              <a
                href="https://wa.me/5491100000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white text-sm font-semibold tracking-wide border-2 border-[#25D366] hover:bg-[#1ebe5d] hover:border-[#1ebe5d] transition-all duration-200"
              >
                <MessageCircle size={15} />
                WhatsApp
              </a>
            </div>

            {/* Map placeholder */}
            <div className="mt-8 aspect-video bg-pava-green-dark/50 border border-pava-cream/10 flex items-center justify-center">
              <div className="text-center text-pava-cream/40">
                <MapPin size={24} className="mx-auto mb-2" />
                <p className="text-xs tracking-wide">
                  Mapa de Google Maps — próximamente
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
