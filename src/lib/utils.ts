import type { MouseEvent } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Stock at or below this (but above 0) is shown as "low stock" — same
 * threshold the admin's stock stepper already colors as a warning.
 */
export const LOW_STOCK_THRESHOLD = 5;

/**
 * Merges Tailwind CSS classes safely.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a price to ARS currency string.
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Truncates a string to a max length.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Converts a slug to a human-readable label.
 */
export function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Returns a category display name.
 */
export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    yerbas: "Yerbas",
    mates: "Mates",
    bombillas: "Bombillas",
    termos: "Termos",
    accesorios: "Accesorios",
    combos: "Combos",
  };
  return map[category] ?? slugToLabel(category);
}

/**
 * Tracks the cursor position over an element as CSS custom properties
 * (--mx/--my), for cards using the .spotlight-overlay radial-gradient.
 */
export function trackSpotlight(e: MouseEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty(
    "--mx",
    `${((e.clientX - rect.left) / rect.width) * 100}%`,
  );
  e.currentTarget.style.setProperty(
    "--my",
    `${((e.clientY - rect.top) / rect.height) * 100}%`,
  );
}

/**
 * Returns a status display info.
 */
export function getStatusInfo(status: string): {
  label: string;
  color: string;
} {
  const map: Record<string, { label: string; color: string }> = {
    available: { label: "Disponible", color: "text-pava-green" },
    out_of_stock: { label: "Agotado", color: "text-pava-terracotta" },
    featured: { label: "Destacado", color: "text-pava-gold" },
  };
  return map[status] ?? { label: status, color: "text-pava-brown-mid" };
}
