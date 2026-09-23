"use client";

import { useEffect, useState } from "react";
import { isStoreOpenNow, getNextOpeningLabel, ScheduleSource } from "@/lib/hours";
import type { SiteSettings } from "@/lib/settings";

export default function StoreLivePill({
  settings,
  hoursWeekday,
  hoursSaturday,
}: {
  settings?: Partial<SiteSettings> | null;
  hoursWeekday?: string;
  hoursSaturday?: string;
}) {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [nextOpening, setNextOpening] = useState<string>("");

  useEffect(() => {
    function update() {
      const source: ScheduleSource | string | undefined = settings || hoursWeekday;
      const secondArg = settings ? undefined : hoursSaturday;
      const open = isStoreOpenNow(source, secondArg);
      setIsOpen(open);
      if (!open) {
        setNextOpening(getNextOpeningLabel(source, secondArg));
      }
    }
    update();
    const timer = setInterval(update, 30_000);
    return () => clearInterval(timer);
  }, [settings, hoursWeekday, hoursSaturday]);

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
