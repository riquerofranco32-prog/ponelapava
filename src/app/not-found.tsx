import Link from "next/link";
import { Search, Home, ShoppingBag, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[85vh] flex items-center justify-center bg-pava-cream px-4 py-28 lg:py-36">
      <div className="max-w-xl w-full text-center">
        {/* Animated Badge & Icon */}
        <div className="inline-flex items-center gap-2 rounded-full border border-pava-brown/15 bg-white px-4 py-1.5 shadow-xs mb-6">
          <span className="text-xl">🧉</span>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-pava-brown">
            Error 404 · Ronda no encontrada
          </span>
        </div>

        {/* Big title */}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-pava-brown leading-[0.95] mb-4">
          ¡Se te enfrió <br />
          <em className="not-italic text-pava-terracotta">el agua del termo!</em>
        </h1>

        <p className="text-sm sm:text-base text-pava-brown-mid/80 max-w-md mx-auto leading-relaxed mb-8">
          La página que estás buscando no existe, fue movida o se lavó la montañita.
        </p>

        {/* Quick Links / Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <Link
            href="/catalogo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-control bg-pava-green px-6 py-3.5 text-sm font-bold text-pava-cream shadow-md shadow-pava-green/20 hover:bg-pava-green-light transition-all active:scale-95"
          >
            <ShoppingBag size={16} />
            <span>Explorar catálogo</span>
            <ArrowRight size={14} />
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-control border border-pava-brown/20 bg-white px-6 py-3.5 text-sm font-semibold text-pava-brown hover:border-pava-green hover:text-pava-green transition-all active:scale-95 shadow-xs"
          >
            <Home size={16} />
            <span>Volver al inicio</span>
          </Link>
        </div>

        {/* Category shortcuts */}
        <div className="rounded-card border border-pava-brown/10 bg-white/70 p-5 backdrop-blur-sm">
          <span className="text-xs font-bold text-pava-brown/60 uppercase tracking-wider block mb-3">
            O encontrá lo que necesitás por categoría:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: "Mates", href: "/catalogo?cat=mates", emoji: "🧉" },
              { label: "Yerbas", href: "/catalogo?cat=yerbas", emoji: "🌿" },
              { label: "Termos", href: "/catalogo?cat=termos", emoji: "🌡️" },
              { label: "Bombillas", href: "/catalogo?cat=bombillas", emoji: "✨" },
              { label: "Combos", href: "/catalogo?cat=combos", emoji: "🎁" },
            ].map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-chip bg-pava-cream-dark border border-pava-brown/10 text-xs font-medium text-pava-brown hover:border-pava-green hover:text-pava-green transition-colors"
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
