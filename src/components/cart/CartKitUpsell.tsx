"use client";

import { useCart } from "@/context/CartContext";
import { Sparkles } from "lucide-react";
import Link from "next/link";

interface UpsellSuggestion {
  emoji: string;
  title: string;
  reason: string;
  href: string;
  triggeredBy: string[]; // category slugs that trigger this suggestion
}

const UPSELL_SUGGESTIONS: UpsellSuggestion[] = [
  {
    emoji: "💎",
    title: "Bombilla de alpaca",
    reason: "Completá tu mate con la bombilla ideal",
    href: "/catalogo?cat=bombillas",
    triggeredBy: ["mates", "calabazas"],
  },
  {
    emoji: "🌿",
    title: "Yerba premium seleccionada",
    reason: "Tu mate sin yerba no está completo",
    href: "/catalogo?cat=yerbas",
    triggeredBy: ["mates", "calabazas", "termos"],
  },
  {
    emoji: "🔥",
    title: "Termo de acero 1L",
    reason: "Para que el agua siempre esté a punto",
    href: "/catalogo?cat=termos",
    triggeredBy: ["mates", "yerbas", "bombillas"],
  },
  {
    emoji: "🪵",
    title: "Kit de curado tradicional",
    reason: "Para estrenar tu mate como un experto",
    href: "/catalogo",
    triggeredBy: ["mates", "calabazas"],
  },
  {
    emoji: "🧉",
    title: "Mate artesanal de calabaza",
    reason: "La base perfecta para tu ronda",
    href: "/catalogo?cat=mates",
    triggeredBy: ["yerbas", "bombillas"],
  },
  {
    emoji: "🎁",
    title: "Combo regalo matero",
    reason: "Armá el kit completo y ahorrá",
    href: "/catalogo",
    triggeredBy: ["termos"],
  },
];

export default function CartKitUpsell() {
  const { items } = useCart();
  if (items.length === 0) return null;

  // Gather all categories in cart
  const cartCategories = new Set(items.map((i) => i.product.category));

  // Pick suggestions relevant to cart contents, excluding already-in-cart categories
  const suggestions = UPSELL_SUGGESTIONS.filter((s) => {
    const triggered = s.triggeredBy.some((cat) => cartCategories.has(cat));
    const alreadyInCart = s.triggeredBy.some((cat) => cartCategories.has(cat) && s.href.includes(cat));
    // show if triggered by a category but suggestion is for a different category
    const suggestedCat = new URL(s.href, "http://x").searchParams.get("cat");
    const suggestedCatInCart = suggestedCat ? cartCategories.has(suggestedCat) : false;
    return triggered && !suggestedCatInCart;
  }).slice(0, 2);

  if (suggestions.length === 0) return null;

  return (
    <div className="border-t border-pava-brown/10 px-5 pt-4 pb-2">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={13} className="text-pava-gold-deep shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-pava-gold-deep">
          Completá tu kit
        </span>
      </div>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <Link
            key={i}
            href={s.href}
            className="flex items-center gap-3 rounded-control bg-pava-cream-dark/40 border border-pava-brown/10 px-3 py-2.5 hover:border-pava-green/40 hover:bg-pava-green/5 transition-all duration-200 group"
          >
            <span className="text-xl shrink-0">{s.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-pava-brown leading-tight truncate group-hover:text-pava-green transition-colors">
                {s.title}
              </p>
              <p className="text-[10px] text-pava-brown-mid/60 leading-tight">
                {s.reason}
              </p>
            </div>
            <span className="shrink-0 text-pava-brown/30 group-hover:text-pava-green text-xs transition-colors">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
