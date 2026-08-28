import { cache } from "react";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { Category } from "@/types";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  sort_order: number;
}

function fromRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    image: row.image,
    icon: row.icon,
    sortOrder: row.sort_order,
  };
}

// React's cache() dedupes this across every server component that calls it
// within the same request, same as getSiteSettings.
export const getCategories = cache(async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return (data as CategoryRow[]).map(fromRow);
});

export type CategoryInput = Omit<Category, "id" | "productCount">;

export async function createCategory(input: CategoryInput): Promise<Category> {
  const { data, error } = await supabaseAdmin()
    .from("categories")
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description,
      image: input.image,
      icon: input.icon,
      sort_order: input.sortOrder ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  return fromRow(data as CategoryRow);
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<Category> {
  const { data, error } = await supabaseAdmin()
    .from("categories")
    .update({
      name: input.name,
      slug: input.slug,
      description: input.description,
      image: input.image,
      icon: input.icon,
      sort_order: input.sortOrder ?? 0,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return fromRow(data as CategoryRow);
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("categories")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabaseAdmin()
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as CategoryRow) : null;
}

// `products.category` stores the category *slug*, and there is no foreign key
// behind it — so the slug is a join key that the admin can edit. Renaming one
// without carrying the products along silently orphans every product in it
// (they vanish from the category filter and from the public menu's grouping).
export async function countProductsInCategory(slug: string): Promise<number> {
  const { count, error } = await supabaseAdmin()
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category", slug);
  if (error) throw error;
  return count ?? 0;
}

export async function moveProductsToCategory(
  fromSlug: string,
  toSlug: string,
): Promise<void> {
  if (fromSlug === toSlug) return;
  const { error } = await supabaseAdmin()
    .from("products")
    .update({ category: toSlug })
    .eq("category", fromSlug);
  if (error) throw error;
}
