import type { Metadata } from "next";
import { Suspense } from "react";
import CatalogClient from "@/components/catalog/CatalogClient";
import PageHeader from "@/components/layout/PageHeader";
import { getProducts } from "@/lib/products";

// Products come from Supabase and are editable from /admin — revalidate
// periodically instead of baking them in at build time.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Explorá nuestro catálogo completo: yerbas, mates artesanales, termos, bombillas, accesorios y combos. Filtrá por categoría y encontrá lo que buscás.",
};

export default async function CatalogPage() {
  const products = await getProducts();

  return (
    <div className="bg-pava-cream min-h-screen">
      <PageHeader
        eyebrow="Nuestros productos"
        title="Catálogo"
        description="Todo lo que necesitás para el mate perfecto. Yerbas seleccionadas, mates artesanales, termos y mucho más."
      />

      {/* Catalog */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-2xl mb-2">🧉</p>
                <p className="text-pava-brown-mid/60 text-sm">
                  Cargando productos...
                </p>
              </div>
            </div>
          }
        >
          <CatalogClient products={products} />
        </Suspense>
      </div>
    </div>
  );
}
