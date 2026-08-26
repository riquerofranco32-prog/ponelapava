import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import { getCoupons } from "@/lib/coupons";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

// Full store backup export endpoint for administrators
export async function GET() {
  try {
    const [products, categories, coupons, settings] = await Promise.all([
      getProducts().catch(() => []),
      getCategories().catch(() => []),
      getCoupons().catch(() => []),
      getSiteSettings().catch(() => null),
    ]);

    const backup = {
      version: "1.0",
      store: "Poné La Pava - Tienda Matera",
      timestamp: new Date().toISOString(),
      counts: {
        products: products.length,
        categories: categories.length,
        coupons: coupons.length,
      },
      data: {
        products,
        categories,
        coupons,
        settings,
      },
    };

    return NextResponse.json(backup);
  } catch (err) {
    console.error("Error generating backup:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al generar backup" },
      { status: 500 }
    );
  }
}
