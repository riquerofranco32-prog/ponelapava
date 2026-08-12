"use client";

import { useEffect, useRef } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: "up" | "left" | "right" | "scale" | "fade";
  delay?: number;
  threshold?: number;
  className?: string;
  as?: React.ElementType;
}

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  threshold = 0.12,
  className = "",
  as: Tag = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add("visible");
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  const directionClass = {
    up: "reveal-up",
    left: "reveal-left",
    right: "reveal-right",
    scale: "reveal-scale",
    fade: "reveal-fade",
  }[direction];

  return (
    <Tag ref={ref} className={`reveal ${directionClass} ${className}`}>
      {children}
    </Tag>
  );
}
