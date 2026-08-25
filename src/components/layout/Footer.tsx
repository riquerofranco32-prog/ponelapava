import Image from "next/image";
import Link from "next/link";
import { MessageCircle, MapPin, Clock, LogIn } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";
import { NAV_LINKS } from "@/lib/nav";
import { INSTAGRAM_URL } from "@/lib/site";
import { getSiteSettings } from "@/lib/settings";
import { whatsappChatUrl } from "@/lib/whatsapp";

const categories = [
  { href: "/catalogo?cat=yerbas", label: "Yerbas" },
  { href: "/catalogo?cat=mates", label: "Mates" },
  { href: "/catalogo?cat=bombillas", label: "Bombillas" },
  { href: "/catalogo?cat=termos", label: "Termos" },
  { href: "/catalogo?cat=accesorios", label: "Accesorios" },
  { href: "/catalogo?cat=combos", label: "Combos" },
];

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const settings = await getSiteSettings();

  return (
    <footer id="contacto" className="bg-pava-brown text-pava-cream/80">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2.5">
              <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-full">
                <Image
                  src="/logo.png"
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-2xl font-bold text-pava-cream">
                  Poné La Pava
                </span>
                <span className="mt-0.5 block text-[10px] tracking-[0.2em] uppercase text-pava-cream/65">
                  Yerbas & Accesorios
                </span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-pava-cream/65 max-w-xs">
              Especialistas en la cultura del mate. Yerbas seleccionadas, mates
              artesanales y todo lo que necesitás para el mate perfecto.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 border border-pava-cream/20 hover:border-pava-cream/50 hover:text-pava-cream transition-all duration-200"
                aria-label="Instagram de Poné La Pava"
              >
                <InstagramIcon size={16} />
              </a>
              <a
                href={whatsappChatUrl(settings.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 border border-pava-cream/20 hover:border-whatsapp hover:text-whatsapp transition-all duration-200"
                aria-label="WhatsApp de Poné La Pava"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-pava-cream text-sm font-semibold tracking-wider uppercase mb-5">
              Navegación
            </h3>
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-pava-cream/65 hover:text-pava-cream transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-pava-cream text-sm font-semibold tracking-wider uppercase mb-5">
              Categorías
            </h3>
            <ul className="flex flex-col gap-3">
              {categories.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-pava-cream/65 hover:text-pava-cream transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Store info */}
          <div>
            <h3 className="text-pava-cream text-sm font-semibold tracking-wider uppercase mb-5">
              El local
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 text-sm text-pava-cream/65">
                <MapPin
                  size={15}
                  className="mt-0.5 shrink-0 text-pava-cream/40"
                />
                <span>
                  {settings.addressLine}
                  <br />
                  {settings.addressCity}
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm text-pava-cream/65">
                <Clock
                  size={15}
                  className="mt-0.5 shrink-0 text-pava-cream/40"
                />
                <span>
                  <span className="block">
                    Lun–Vie: {settings.hoursWeekday}
                  </span>
                  <span className="block">Sáb: {settings.hoursSaturday}</span>
                </span>
              </div>
              <a
                href={whatsappChatUrl(settings.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-whatsapp hover:text-whatsapp-dark transition-colors duration-200 font-medium"
              >
                <MessageCircle size={15} />
                Escribinos por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Shipping trust bar */}
      <div className="border-t border-pava-cream/10 bg-pava-brown-dark/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-pava-cream/70 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="font-semibold text-pava-cream mr-1">Medios de pago:</span>
              <span className="rounded-chip bg-pava-cream/10 border border-pava-cream/15 px-2.5 py-1 text-[11px]">Mercado Pago</span>
              <span className="rounded-chip bg-pava-gold/20 border border-pava-gold/40 text-pava-gold px-2.5 py-1 text-[11px] font-bold">Transferencia 10% OFF</span>
              <span className="rounded-chip bg-pava-cream/10 border border-pava-cream/15 px-2.5 py-1 text-[11px]">Tarjeta en 3 cuotas</span>
              <span className="rounded-chip bg-pava-cream/10 border border-pava-cream/15 px-2.5 py-1 text-[11px]">Efectivo en local</span>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2">
              <span className="font-semibold text-pava-cream mr-1">Envíos seguros:</span>
              <span className="rounded-chip bg-pava-cream/10 border border-pava-cream/15 px-2.5 py-1 text-[11px]">Correo Argentino</span>
              <span className="rounded-chip bg-pava-cream/10 border border-pava-cream/15 px-2.5 py-1 text-[11px]">Andreani</span>
              <span className="rounded-chip bg-pava-cream/10 border border-pava-cream/15 px-2.5 py-1 text-[11px]">Retiro en Catriel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-pava-cream/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-pava-cream/65">
              © {currentYear} Poné La Pava. Todos los derechos reservados.
            </p>
            <p className="text-xs text-pava-cream/65">
              Hecho con mate 🧉 en Río Negro, Argentina
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-pava-cream/40 transition-colors duration-200 hover:text-pava-cream/70"
            >
              <LogIn size={12} />
              Acceso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
