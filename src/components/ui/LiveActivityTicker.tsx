"use client";

import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";

interface Activity {
  icon: string;
  name: string;
  location: string;
  action: string;
  time: string;
}

const ACTIVITIES: Activity[] = [
  {
    icon: "🧉",
    name: "Lucas",
    location: "Neuquén",
    action: "compró un Mate Camionero de Vaqueta",
    time: "Hace 4 min",
  },
  {
    icon: "🌿",
    name: "Mariana",
    location: "General Roca",
    action: "eligió Yerba Canarias Serena 1kg",
    time: "Hace 12 min",
  },
  {
    icon: "🚚",
    name: "Pedido #1084",
    location: "Catriel",
    action: "despachado hacia Bariloche",
    time: "Hace 18 min",
  },
  {
    icon: "✨",
    name: "Santiago",
    location: "Cipolletti",
    action: "sumó un Termo Stanley Mate System",
    time: "Hace 25 min",
  },
  {
    icon: "🧉",
    name: "Valentina",
    location: "Cinco Saltos",
    action: "se llevó un Mate Imperial con virola de alpaca",
    time: "Hace 32 min",
  },
];

export function LiveActivityTicker() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    // Initial delay before first popup
    const initialTimer = setTimeout(() => {
      setVisible(true);
    }, 3500);

    // Interval to cycle activities
    const cycleInterval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % ACTIVITIES.length);
        setVisible(true);
      }, 600);
    }, 8500);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(cycleInterval);
    };
  }, [dismissed]);

  if (dismissed) return null;

  const current = ACTIVITIES[index];

  return (
    <div
      className={`fixed bottom-5 left-5 z-40 max-w-[320px] sm:max-w-[360px] transition-all duration-500 ${
        visible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-6 opacity-0 scale-95 pointer-events-none"
      }`}
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-card border border-pava-gold/30 bg-pava-green-dark/95 p-3.5 shadow-2xl backdrop-blur-md text-pava-cream">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pava-gold/15 text-lg border border-pava-gold/30 shadow-inner">
          {current.icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-xs font-bold text-pava-gold">
              {current.name} <span className="font-normal text-pava-cream/60">de {current.location}</span>
            </span>
            <span className="text-[10px] text-pava-cream/50 shrink-0 font-medium">
              {current.time}
            </span>
          </div>
          <p className="truncate text-xs text-pava-cream/90 font-medium mt-0.5">
            {current.action}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Cerrar notificación"
          className="text-pava-cream/40 hover:text-pava-cream transition-colors p-1"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
