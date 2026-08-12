import Link from "next/link";
import { MessageCircle, MapPin, Clock } from "lucide-react";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#el-local", label: "El local" },
  { href: "/#como-comprar", label: "Cómo comprar" },
];

const categories = [
  { href: "/catalogo?cat=yerbas", label: "Yerbas" },
  { href: "/catalogo?cat=mates", label: "Mates" },
  { href: "/catalogo?cat=bombillas", label: "Bombillas" },
  { href: "/catalogo?cat=termos", label: "Termos" },
  { href: "/catalogo?cat=accesorios", label: "Accesorios" },
  { href: "/catalogo?cat=combos", label: "Combos" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contacto" className="bg-pava-brown text-pava-cream/80">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="block mb-4">
              <span className="font-display text-2xl font-bold text-pava-cream">
                Poné La Pava
              </span>
              <span className="block text-[10px] tracking-[0.2em] uppercase text-pava-cream/50 mt-0.5">
                Yerbas & Accesorios
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-pava-cream/60 max-w-xs">
              Especialistas en la cultura del mate. Yerbas seleccionadas,
              mates artesanales y todo lo que necesitás para el mate perfecto.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://www.instagram.com/ponelapava_yerbas/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 border border-pava-cream/20 hover:border-pava-cream/50 hover:text-pava-cream transition-all duration-200"
                aria-label="Instagram de Poné La Pava"
              >
                <InstagramIcon size={16} />
              </a>
              <a
                href="https://wa.me/5491100000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 border border-pava-cream/20 hover:border-[#25D366] hover:text-[#25D366] transition-all duration-200"
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
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-pava-cream/60 hover:text-pava-cream transition-colors duration-200"
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
                    className="text-sm text-pava-cream/60 hover:text-pava-cream transition-colors duration-200"
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
              <div className="flex items-start gap-3 text-sm text-pava-cream/60">
                <MapPin size={15} className="mt-0.5 shrink-0 text-pava-cream/40" />
                <span>
                  {/* PLACEHOLDER: reemplazar con la dirección real */}
                  Dirección a confirmar<br />
                  Argentina
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm text-pava-cream/60">
                <Clock size={15} className="mt-0.5 shrink-0 text-pava-cream/40" />
                <span>
                  {/* PLACEHOLDER: reemplazar con los horarios reales */}
                  Lun–Vie: 9:00 – 19:00<br />
                  Sáb: 9:00 – 14:00
                </span>
              </div>
              <a
                href="https://wa.me/5491100000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#25D366] hover:text-[#1ebe5d] transition-colors duration-200 font-medium"
              >
                <MessageCircle size={15} />
                Escribinos por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-pava-cream/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-pava-cream/40">
              © {currentYear} Poné La Pava. Todos los derechos reservados.
            </p>
            <p className="text-xs text-pava-cream/30">
              Hecho con mate 🧉 en Argentina
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
