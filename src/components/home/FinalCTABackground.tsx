"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// FinalCTA itself stays a server component (fetches settings for the
// WhatsApp link), so the video/reduced-motion toggle — which needs
// useEffect — lives in this small client-only background piece instead.
export default function FinalCTABackground() {
  const [allowVideo, setAllowVideo] = useState(false);

  useEffect(() => {
    setAllowVideo(
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  return (
    <div className="absolute inset-0">
      {allowVideo ? (
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
