import { CreditCard, Sparkles, Truck, MapPin, Star, ShieldCheck } from "lucide-react";
import OpenStatusBadge from "@/components/ui/OpenStatusBadge";

interface TrustItemData {
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  title: string;
  subtitle: string | null;
  badge?: string;
}

const items: TrustItemData[] = [
  {
    icon: CreditCard,
    title: "3 Cuotas Sin Interés",
    subtitle: "Con todas las tarjetas bancarias",
    badge: "3 CUOTAS",
  },
  {
    icon: Sparkles,
    title: "10% OFF con Transferencia",
    subtitle: "O en efectivo retirando en el local",
    badge: "10% OFF",
  },
  {
    icon: Truck,
    title: "Envíos Gratis a Todo el País",
    subtitle: "En compras superiores a $65.000",
    badge: "GRATIS",
  },
  {
    icon: MapPin,
    title: "Local Oficial en Catriel",
    subtitle: null,
    badge: "RETIRO IN SITU",
  },
  {
    icon: Star,
    title: "Calificación 5.0 en Google",
    subtitle: "Reseñas 100% reales de clientes",
    badge: "★★★★★",
  },
  {
    icon: ShieldCheck,
    title: "Garantía Artesanal",
    subtitle: "Calabaza gruesa y alpaca maciza",
    badge: "CALIDAD",
  },
];

function TrustItem({ icon: Icon, title, subtitle, badge }: TrustItemData) {
  return (
    <div className="flex shrink-0 items-center gap-3.5 px-6 py-2 transition-all duration-300 group cursor-default">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-pava-gold/40 bg-pava-gold/15 text-pava-gold shadow-md shadow-pava-gold/5 transition-transform duration-300 group-hover:scale-105 group-hover:bg-pava-gold group-hover:text-pava-brown">
        <Icon size={20} strokeWidth={2} aria-hidden="true" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold tracking-wide whitespace-nowrap text-white">
            {title}
          </span>
          {badge && (
            <span className="rounded-full bg-pava-gold/20 border border-pava-gold/40 px-2 py-0.5 text-[9px] font-extrabold text-pava-gold tracking-wider uppercase">
              {badge}
            </span>
          )}
        </div>
        {subtitle ? (
          <div className="text-[11px] whitespace-nowrap text-pava-cream/75 font-medium">
            {subtitle}
          </div>
        ) : (
          <div className="mt-0.5">
            <OpenStatusBadge />
          </div>
        )}
      </div>
      <span
        className="ml-6 h-1.5 w-1.5 shrink-0 rotate-45 bg-pava-gold/40"
        aria-hidden="true"
      />
    </div>
  );
}

export default function TrustBar() {
  return (
    <section className="overflow-hidden border-y border-pava-gold/20 bg-[#0f1d13] py-4.5 shadow-inner">
      {/* Duplicated track for a seamless infinite loop */}
      <div className="marquee-track items-center hover:[animation-play-state:paused]">
        {items.map((item) => (
          <TrustItem key={item.title} {...item} />
        ))}
        <div aria-hidden="true" className="contents">
          {items.map((item) => (
            <TrustItem key={`dup-${item.title}`} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
