"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// FinalCTA itself stays a server component (fetches settings for the
// WhatsApp link), so the video/reduced-motion toggle — which needs
// useEffect — lives in this small client-only background piece instead.
export default function FinalCTABackground() {
  const [allowVideo, setAllowVideo] = useState(false);
  const [nearViewport, setNearViewport] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAllowVideo(
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  // This section sits below the fold — defer the ~1.3MB video download
  // until the user actually scrolls near it, instead of on page load.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="absolute inset-0">
      {allowVideo && nearViewport ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/about_section_1786546070863.png"
          className="absolute inset-0 h-full w-full object-cover object-center"
        >
          <source src="/final-mate-pour.mp4" type="video/mp4" />
        </video>
      ) : (
        <Image
          src="/about_section_1786546070863.png"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 bg-pava-brown/75" />
      <div className="absolute inset-0 bg-gradient-to-r from-pava-brown via-pava-brown/55 to-pava-brown/15" />
    </div>
  );
}
