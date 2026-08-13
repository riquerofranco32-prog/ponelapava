"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";

export function ProductThumb({
  src,
  size = 40,
}: {
  src?: string;
  size?: number;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: 8,
        overflow: "hidden",
        background: "var(--dash-surface-2)",
        border: "1px solid var(--dash-border)",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={`${size}px`}
          style={{ objectFit: "cover" }}
        />
      ) : (
        <ImageOff size={size * 0.4} color="var(--dash-muted)" />
      )}
    </div>
  );
}
