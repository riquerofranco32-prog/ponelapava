"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// FinalCTA itself stays a server component (fetches settings for the
// WhatsApp link), so the video/reduced-motion toggle — which needs
// useEffect — lives in this small client-only background piece instead.
export default function FinalCTABackground() {
  const ref = useRef<HTMLDivElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowVideo(true);
          observer.disconnect();
        }
      },
      // Esta sección vive a ~9 viewports del hero en mobile, así que su video
      // (1,2 MB) no tiene por qué competir con la carga inicial. Un viewport
      // de anticipación alcanza para que ya esté corriendo al llegar.
      { rootMargin: "100% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="absolute inset-0">
      {/* Misma estructura que el hero: la imagen es la capa de fondo estable y
          el video se apila encima cuando corresponde. Sin `poster`, que se
          servía crudo desde /public sin pasar por el optimizador. */}
      <Image
        src="/about_section_1786546070863.png"
        alt=""
        fill
        className="object-cover object-center"
        sizes="100vw"
        aria-hidden="true"
      />
      {showVideo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full object-cover object-center"
        >
          <source src="/final-mate-pour.mp4" type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-pava-brown/75" />
      <div className="absolute inset-0 bg-gradient-to-r from-pava-brown via-pava-brown/55 to-pava-brown/15" />
    </div>
  );
}
