"use client";

import { useEffect, useState } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { isStoreOpenNow } from "@/lib/hours";

// Starts null (matches server HTML, avoids a hydration mismatch) and
// resolves on mount — the open/closed check depends on the visitor's
// clock, which the server can't know in advance.
export default function OpenStatusBadge() {
  const settings = useSiteSettings();
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  useEffect(() => {
    function check() {
      setIsOpen(isStoreOpenNow(settings.hoursWeekday, settings.hoursSaturday));
    }
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [settings.hoursWeekday, settings.hoursSaturday]);

  if (isOpen === null) {
    return (
      <span className="text-[11px] text-pava-cream/65">Vení a conocernos.</span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-[11px] text-pava-cream/65">
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          isOpen ? "bg-pava-green-light" : "bg-pava-terracotta-light"
        }`}
        aria-hidden="true"
      />
      {isOpen ? "Abierto ahora" : "Cerrado ahora"}
    </span>
  );
}
