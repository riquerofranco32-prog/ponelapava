import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductById, getRelatedProducts } from "@/data/products";
import ProductDetail from "@/components/product/ProductDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
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
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const related = getRelatedProducts(product, 4);

  return <ProductDetail product={product} related={related} />;
}
