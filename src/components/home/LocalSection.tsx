import Image from "next/image";
import { MapPin, Clock, MessageCircle, ExternalLink } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import StoreLivePill from "@/components/ui/StoreLivePill";
import { whatsappChatUrl } from "@/lib/whatsapp";
import {
  getSiteSettings,
  buildMapsUrl,
  buildMapsEmbedUrl,
} from "@/lib/settings";

// Real photos of the store. Deliberately NOT pulled from the Google Maps
// listing: its cover photo (and at least one other) turned out to be a
// neighboring hotel's reception, not this store — bad data on Google's
// end, not something to propagate onto the site. Worth reporting/fixing
// on the real listing.
const LOCAL_PHOTOS = [
  { src: "/ig_storefront.jpg", alt: "Frente del local Poné La Pava" },
  { src: "/local-shelf-1.jpg", alt: "Estantería de termos y yerbas" },
  { src: "/local-shelf-2.jpg", alt: "Mates de cuero y accesorios" },
  { src: "/local-shelf-3.jpg", alt: "Bolsos y mates artesanales" },
  { src: "/local-shelf-4.jpg", alt: "Termos y vasos térmicos" },
  { src: "/local-shelf-5.jpg", alt: "Bombillas y mates en exhibición" },
  { src: "/local-shelf-6.jpg", alt: "Vista general del local" },
];

export default async function LocalSection() {
  const settings = await getSiteSettings();
  const mapsUrl = buildMapsUrl(settings.addressLine, settings.addressCity);
  const mapsEmbedUrl = buildMapsEmbedUrl(
    settings.addressLine,
    settings.addressCity,
  );

  return (
    <section
      id="el-local"
      className="overflow-hidden bg-pava-green py-20 text-pava-cream sm:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <ScrollReveal direction="left" className="relative lg:col-span-7">
            <div className="grid grid-cols-3 gap-3">
              {/* Live map — desaturated + brand-tinted until hovered */}
              <div className="local-map-frame group relative col-span-3 aspect-[16/10] overflow-hidden rounded-card bg-pava-green-dark sm:aspect-[16/9]">
                <iframe
                  src={mapsEmbedUrl}
                  title="Ubicación de Poné La Pava en el mapa"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="local-map-iframe h-full w-full border-0"
                />
                <div
                  className="local-map-tint pointer-events-none absolute inset-0"
                  aria-hidden="true"
                />
                {/* Decorative brand pin — the real Google pin already marks
                    the exact spot; this just carries the brand mark. */}
                <div className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-full">
                  <span className="local-map-pin relative flex flex-col items-center">
                    <span className="whitespace-nowrap rounded-full bg-pava-brown px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-pava-cream shadow-lg">
                      Poné La Pava
                    </span>
                    <span className="-mt-[3px] h-2.5 w-2.5 rotate-45 bg-pava-brown" />
                  </span>
                </div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-control bg-pava-brown/90 px-3 py-2 text-[11px] font-semibold text-pava-cream backdrop-blur-sm transition-colors hover:bg-pava-brown"
                >
                  Ver en Google Maps <ExternalLink size={12} />
                </a>
              </div>

              {/* Real photos of the store — same ones on the Maps listing */}
              {LOCAL_PHOTOS.map((photo) => (
                <a
                  key={photo.src}
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="img-hover-zoom relative aspect-square overflow-hidden rounded-control bg-pava-green-dark"
                  aria-label={`${photo.alt} — ver más fotos en Google Maps`}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 33vw, 19vw"
                  />
                </a>
              ))}
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
                  <StoreLivePill
                    hoursWeekday={settings.hoursWeekday}
                    hoursSaturday={settings.hoursSaturday}
                  />
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
                className="inline-flex items-center justify-center gap-2 rounded-control border-2 border-pava-gold bg-pava-gold px-5 py-3 text-sm font-semibold tracking-wide text-pava-brown transition-colors hover:border-pava-gold-light hover:bg-pava-gold-light"
              >
                <ExternalLink size={15} /> Cómo llegar
              </a>
              <a
                href={whatsappChatUrl(settings.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-control border border-pava-cream/30 px-5 py-3 text-sm font-semibold tracking-wide text-pava-cream transition-colors hover:border-whatsapp hover:bg-whatsapp"
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
