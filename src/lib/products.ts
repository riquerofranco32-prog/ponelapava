import { supabase, supabaseAdmin } from "@/lib/supabase";
import { Product, ProductCategory, ProductStatus } from "@/types";

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description: string | null;
  price: number;
  category: string;
  status: string;
  stock: number;
  images: string[];
  tags: string[];
  weight: string | null;
  brand: string | null;
  featured: boolean;
  created_at: string;
}

function fromRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    longDescription: row.long_description ?? undefined,
    price: row.price,
    category: row.category as ProductCategory,
    status: row.status as ProductStatus,
    stock: row.stock,
    images: row.images,
    tags: row.tags,
    weight: row.weight ?? undefined,
    brand: row.brand ?? undefined,
    featured: row.featured,
    createdAt: row.created_at,
  };
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id");
  if (error) throw error;
  return (data as ProductRow[]).map(fromRow);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("featured", true)
    .order("id");
  if (error) throw error;
  return (data as ProductRow[]).map(fromRow);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as ProductRow) : undefined;
}

export async function getProductsByCategory(
  category: string,
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .order("id");
  if (error) throw error;
  return (data as ProductRow[]).map(fromRow);
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", product.category)
    .neq("id", product.id)
    .limit(limit);
  if (error) throw error;
  return (data as ProductRow[]).map(fromRow);
}

// ── Admin mutations — server-only, use the service role key ──────────

export type ProductInput = Omit<Product, "id" | "createdAt">;

// Stock is the source of truth for availability: whatever status a caller
// passes, 0 stock always reads as out_of_stock and restocking always clears
// that flag. Enforced here (not just in the admin form) so no write path —
// current or future — can leave stock and status out of sync in the DB.
function syncStatus(stock: number, status: ProductStatus): ProductStatus {
  if (stock <= 0) return "out_of_stock";
  if (status === "out_of_stock") return "available";
  return status;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const id = crypto.randomUUID();
  const stock = input.stock ?? 0;
  const { data, error } = await supabaseAdmin()
    .from("products")
    .insert({
      id,
      name: input.name,
      slug: input.slug,
      description: input.description,
      long_description: input.longDescription ?? null,
      price: input.price,
      category: input.category,
      status: syncStatus(stock, input.status),
      stock,
      images: input.images,
      tags: input.tags ?? [],
      weight: input.weight ?? null,
      brand: input.brand ?? null,
      featured: input.featured ?? false,
    })
    .select()
    .single();
  if (error) throw error;
  return fromRow(data as ProductRow);
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<Product> {
  const stock = input.stock ?? 0;
  const { data, error } = await supabaseAdmin()
    .from("products")
    .update({
      name: input.name,
      slug: input.slug,
      description: input.description,
      long_description: input.longDescription ?? null,
      price: input.price,
      category: input.category,
      status: syncStatus(stock, input.status),
      stock,
      images: input.images,
      tags: input.tags ?? [],
      weight: input.weight ?? null,
      brand: input.brand ?? null,
      featured: input.featured ?? false,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return fromRow(data as ProductRow);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("products")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
