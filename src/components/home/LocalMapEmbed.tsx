"use client";

import { useEffect, useRef, useState } from "react";

/* Con el foco ADENTRO de un iframe cross-origin (el embed de Google Maps
   corre en otro proceso), en el documento host no matchea ni :focus ni
   :focus-within — medido con Tab real: activeElement es el iframe y ambos
   selectores dan false. La única detección confiable es por eventos: cuando
   el foco entra al iframe, window dispara blur con activeElement apuntando
   al iframe. El anillo va inset (offset negativo) porque el frame del mapa
   recorta con overflow-hidden. */
export default function LocalMapEmbed({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const sync = () => setFocused(document.activeElement === ref.current);
    window.addEventListener("blur", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("blur", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={`local-map-iframe h-full w-full border-0 ${focused ? "local-map-iframe--focus" : ""}`}
    />
  );
}
