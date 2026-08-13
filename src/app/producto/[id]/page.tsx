import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductById, getRelatedProducts } from "@/lib/products";
import ProductDetail from "@/components/product/ProductDetail";
import { SITE_URL } from "@/lib/site";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.images[0], alt: product.name }],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((src) => `${SITE_URL}${src}`),
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/producto/${product.id}`,
      priceCurrency: "ARS",
      price: product.price,
      availability:
        product.status === "out_of_stock"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} related={related} />
    </>
  );
}
