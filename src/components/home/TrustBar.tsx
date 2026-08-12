import { Leaf, Heart, MessageCircle, MapPin } from "lucide-react";

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
    subtitle: "Vení a conocernos.",
  },
  {
    icon: MessageCircle,
    title: "Pedí por WhatsApp",
    subtitle: "Rápido y directo.",
  },
];

export default function TrustBar() {
  return (
    <section className="bg-pava-brown">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-5 py-10 sm:px-8 lg:grid-cols-4 lg:gap-y-0 lg:px-10 lg:py-8">
        {items.map(({ icon: Icon, title, subtitle }) => (
          <div key={title} className="flex items-center gap-3.5">
            <Icon
              className="shrink-0 text-pava-gold"
              size={22}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <div>
              <div className="text-[13px] font-semibold text-pava-cream">
                {title}
              </div>
              <div className="text-[11px] text-pava-cream/50">{subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
