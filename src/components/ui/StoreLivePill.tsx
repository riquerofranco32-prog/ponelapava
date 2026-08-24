"use client";

import { useEffect, useState } from "react";
import { isStoreOpenNow, getNextOpeningLabel } from "@/lib/hours";

export default function StoreLivePill({
  hoursWeekday,
  hoursSaturday,
}: {
  hoursWeekday: string;
  hoursSaturday: string;
}) {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [nextOpening, setNextOpening] = useState<string>("");

  useEffect(() => {
    function update() {
      const open = isStoreOpenNow(hoursWeekday, hoursSaturday);
      setIsOpen(open);
      if (!open) {
        setNextOpening(getNextOpeningLabel(hoursWeekday, hoursSaturday));
      }
    }
    update();
    const timer = setInterval(update, 30_000);
    return () => clearInterval(timer);
  }, [hoursWeekday, hoursSaturday]);

  if (isOpen === null) return null;

  return (
    <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-pava-cream/15 bg-pava-cream/5 px-2.5 py-1 text-xs backdrop-blur-sm">
      <span className="relative flex h-2 w-2">
        {isOpen && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            isOpen ? "bg-emerald-400" : "bg-amber-400/80"
          }`}
        />
      </span>
      <span className="font-medium text-pava-cream/90">
        {isOpen ? "Abierto ahora" : `Cerrado · Abre ${nextOpening}`}
      </span>
    </div>
  );
}
