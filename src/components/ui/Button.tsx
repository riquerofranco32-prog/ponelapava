import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "whatsapp";
  size?: "sm" | "md" | "lg";
  href?: string;
  target?: string;
  rel?: string;
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-pava-green text-pava-cream hover:bg-pava-green-light border-2 border-pava-green hover:border-pava-green-light",
  secondary:
    "bg-pava-terracotta text-white hover:bg-pava-terracotta-light border-2 border-pava-terracotta hover:border-pava-terracotta-light",
  outline:
    "bg-transparent text-pava-green border-2 border-pava-green hover:bg-pava-green hover:text-pava-cream",
  ghost:
    "bg-transparent text-pava-brown hover:bg-pava-cream-dark border-2 border-transparent",
  whatsapp:
    "bg-whatsapp text-white hover:bg-whatsapp-dark border-2 border-whatsapp hover:border-whatsapp-dark",
};

const sizeClasses: Record<string, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  target,
  rel,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  if (href) {
    // Internal links use next/link for client-side navigation; external
    // links (WhatsApp, Instagram, maps) stay as plain anchors.
    if (href.startsWith("/") && !target) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target={target} rel={rel} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
