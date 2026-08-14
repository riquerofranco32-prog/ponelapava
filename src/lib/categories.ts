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
