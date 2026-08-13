import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getProducts } from "@/lib/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/catalogo`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/carrito`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const products = await getProducts();
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/producto/${product.id}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}
