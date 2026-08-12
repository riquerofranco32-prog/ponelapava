import type { Metadata } from "next";
import { Suspense } from "react";
import CatalogClient from "@/components/catalog/CatalogClient";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Explorá nuestro catálogo completo: yerbas, mates artesanales, termos, bombillas, accesorios y combos. Filtrá por categoría y encontrá lo que buscás.",
};

export default function CatalogPage() {
  return (
    <div className="bg-pava-cream min-h-screen">
      {/* Page header */}
      <div className="bg-pava-green py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-px bg-pava-gold" />
            <span className="text-xs tracking-[0.2em] uppercase text-pava-gold font-medium">
              Nuestros productos
            </span>
          </div>
          <h1 className="font-display text-5xl lg:text-6xl font-bold text-pava-cream">
            Catálogo
          </h1>
          <p className="mt-4 text-pava-cream/70 max-w-lg">
            Todo lo que necesitás para el mate perfecto. Yerbas seleccionadas,
            mates artesanales, termos y mucho más.
          </p>
        </div>
      </div>

      {/* Catalog */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-2xl mb-2">🧉</p>
              <p className="text-pava-brown-mid/60 text-sm">Cargando productos...</p>
            </div>
          </div>
        }>
          <CatalogClient />
        </Suspense>
      </div>
    </div>
  );
}
