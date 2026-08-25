import { Leaf, Heart, MessageCircle, MapPin, Sparkles, ShieldCheck } from "lucide-react";
import OpenStatusBadge from "@/components/ui/OpenStatusBadge";

const items = [
  {
    icon: Leaf,
    title: "Productos seleccionados",
    subtitle: "Calidad artesanal que se siente.",
  },
  {
    icon: Sparkles,
    title: "Envío Bonificado",
    subtitle: "En compras mayores a $65.000.",
  },
  {
    icon: Heart,
    title: "Atención personalizada",
    subtitle: "Te asesoramos en cada ronda.",
  },
  {
    icon: MapPin,
    title: "Local en Catriel",
    subtitle: null,
  },
  {
    icon: MessageCircle,
    title: "Pedí por WhatsApp",
    subtitle: "Rápido, simple y directo.",
  },
  {
    icon: ShieldCheck,
    title: "Compra 100% segura",
    subtitle: "Garantía en cada producto.",
  },
];

function TrustItem({ icon: Icon, title, subtitle }: (typeof items)[number]) {
  return (
    <div className="flex shrink-0 items-center gap-3.5 px-6 py-2 transition-all duration-300">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-pava-gold/30 bg-pava-gold/10 text-pava-gold">
        <Icon
          size={19}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </div>
      <div>
        <div className="text-[13px] font-bold tracking-wide whitespace-nowrap text-pava-cream">
          {title}
        </div>
        {subtitle ? (
          <div className="text-[11px] whitespace-nowrap text-pava-cream/70 font-medium">
            {subtitle}
          </div>
        ) : (
          <OpenStatusBadge />
        )}
      </div>
      <span
        className="ml-6 h-1.5 w-1.5 shrink-0 rotate-45 bg-pava-gold/50"
        aria-hidden="true"
      />
    </div>
  );
}

export default function TrustBar() {
  return (
    <section className="overflow-hidden border-y border-pava-cream/10 bg-pava-green-dark py-5">
      {/* Duplicated track for a seamless infinite loop; the copy is
          aria-hidden since it repeats the same content for visual effect. */}
      <div className="marquee-track items-center">
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
