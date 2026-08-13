import Image from "next/image";
import { MapPin, Clock, MessageCircle, ExternalLink } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { whatsappChatUrl } from "@/lib/whatsapp";
import { getSiteSettings, buildMapsUrl } from "@/lib/settings";

export default async function LocalSection() {
  const settings = await getSiteSettings();
  const mapsUrl = buildMapsUrl(settings.addressLine, settings.addressCity);

  return (
    <section
      id="el-local"
      className="overflow-hidden bg-pava-green py-20 text-pava-cream sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <ScrollReveal direction="left" className="relative lg:col-span-7">
            <div className="relative aspect-[4/5] overflow-hidden bg-pava-green-dark sm:aspect-[5/4]">
              <Image
                src="/local_store_1786546091007.png"
                alt="Interior del local Poné La Pava"
                fill
                className="object-cover transition-transform duration-700 hover:scale-[1.025]"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pava-green-dark/55 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-4 left-4 border border-pava-cream/25 bg-pava-green-dark/80 px-4 py-3 backdrop-blur-sm sm:bottom-6 sm:left-6">
              <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-pava-gold">
                Nuestro espacio
              </span>
              <span className="mt-1 block text-sm font-medium text-pava-cream">
                Mate, charla y cercanía
              </span>
            </div>
            <div className="absolute -bottom-5 -right-5 hidden h-28 w-28 border-2 border-pava-gold/30 lg:block" />
          </ScrollReveal>

          <ScrollReveal direction="right" className="lg:col-span-5 lg:pl-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-9 bg-pava-gold" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-pava-gold">
                El local
              </span>
            </div>
            <h2 className="font-display text-4xl font-bold leading-[0.95] tracking-tight text-pava-cream sm:text-5xl lg:text-6xl">
              Vení, elegí
              <br />
              <em className="not-italic text-pava-gold">y quedate un rato.</em>
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-pava-cream/70">
              Nuestro local físico es el punto de encuentro de los mateadores.
              Venís, tocás los productos, los olés y encontrás ese detalle que
              hace propio a tu ritual.
            </p>

            <div className="mt-10 space-y-0 border-y border-pava-cream/15">
              <div className="flex gap-4 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-pava-cream/10">
                  <MapPin size={18} className="text-pava-gold" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-pava-cream/65">
                    Dirección
                  </span>
                  <p className="mt-1 font-medium text-pava-cream">
                    {settings.addressLine}
                  </p>
                  <p className="text-sm text-pava-cream/65">
                    {settings.addressCity}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 border-t border-pava-cream/15 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-pava-cream/10">
                  <Clock size={18} className="text-pava-gold" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-pava-cream/65">
                    Horarios
                  </span>
                  <p className="mt-1 text-sm font-medium text-pava-cream">
                    Lun–Vie: {settings.hoursWeekday} hs
                  </p>
                  <p className="text-sm text-pava-cream/70">
                    Sáb: {settings.hoursSaturday} hs
                  </p>
                </div>
              </div>
              <div className="flex gap-4 border-t border-pava-cream/15 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-pava-cream/10">
                  <MessageCircle size={18} className="text-whatsapp" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-pava-cream/65">
                    WhatsApp
                  </span>
                  <a
                    href={whatsappChatUrl(settings.whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block font-medium text-pava-cream transition-colors hover:text-whatsapp"
                  >
                    {settings.whatsappDisplay}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border-2 border-pava-gold bg-pava-gold px-5 py-3 text-sm font-semibold tracking-wide text-pava-brown transition-colors hover:border-pava-gold-light hover:bg-pava-gold-light"
              >
                <ExternalLink size={15} /> Cómo llegar
              </a>
              <a
                href={whatsappChatUrl(settings.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-pava-cream/30 px-5 py-3 text-sm font-semibold tracking-wide text-pava-cream transition-colors hover:border-whatsapp hover:bg-whatsapp"
              >
                <MessageCircle size={15} /> WhatsApp
              </a>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
