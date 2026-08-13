import { Leaf, Heart, MessageCircle, MapPin } from "lucide-react";
import OpenStatusBadge from "@/components/ui/OpenStatusBadge";

const items = [
  {
    icon: Leaf,
    title: "Productos seleccionados",
    subtitle: "Calidad que se siente.",
  },
  {
    icon: Heart,
    title: "Atención personalizada",
    subtitle: "Te ayudamos a elegir.",
  },
  {
    icon: MapPin,
    title: "Local en Catriel",
    subtitle: null,
  },
  {
    icon: MessageCircle,
    title: "Pedí por WhatsApp",
    subtitle: "Rápido y directo.",
  },
];

function TrustItem({ icon: Icon, title, subtitle }: (typeof items)[number]) {
  return (
    <div className="flex shrink-0 items-center gap-3.5 px-8">
      <Icon
        className="shrink-0 text-pava-gold"
        size={22}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <div>
        <div className="text-[13px] font-semibold whitespace-nowrap text-pava-cream">
          {title}
        </div>
        {subtitle ? (
          <div className="text-[11px] whitespace-nowrap text-pava-cream/65">
            {subtitle}
          </div>
        ) : (
          <OpenStatusBadge />
        )}
      </div>
      <span
        className="ml-4 h-1 w-1 shrink-0 rounded-full bg-pava-gold/40"
        aria-hidden="true"
      />
    </div>
  );
}

export default function TrustBar() {
  return (
    <section className="overflow-hidden border-y border-pava-cream/10 bg-pava-brown py-7">
      {/* Duplicated track for a seamless infinite loop; the copy is
          aria-hidden since it repeats the same content for visual effect. */}
      <div className="marquee-track">
        {items.map((item) => (
          <TrustItem key={item.title} {...item} />
        ))}
        {items.map((item) => (
          <TrustItem key={`dup-${item.title}`} {...item} />
        ))}
      </div>
    </section>
  );
}
