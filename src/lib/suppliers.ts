import { supabaseAdmin } from "@/lib/supabase";
import { Supplier, SupplierInput } from "@/types";

interface SupplierRow {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: SupplierRow): Supplier {
  return {
    id: row.id,
    name: row.name,
    contactName: row.contact_name ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabaseAdmin()
    .from("suppliers")
    .select("*")
    .order("name");

  // In case suppliers table doesn't exist yet before migration is executed
  if (error) {
    if (error.code === "42P01" || error.code === "PGRST204") {
      return [];
    }
    throw error;
  }
  return (data as SupplierRow[]).map(fromRow);
}

export async function getSupplierById(id: string): Promise<Supplier | undefined> {
  const { data, error } = await supabaseAdmin()
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") return undefined;
    throw error;
  }
  return data ? fromRow(data as SupplierRow) : undefined;
}

export async function createSupplier(input: SupplierInput): Promise<Supplier> {
  const id = crypto.randomUUID();
  const { data, error } = await supabaseAdmin()
    .from("suppliers")
    .insert({
      id,
      name: input.name,
      contact_name: input.contactName ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return fromRow(data as SupplierRow);
}

export async function updateSupplier(
  id: string,
  input: SupplierInput
): Promise<Supplier> {
  const { data, error } = await supabaseAdmin()
    .from("suppliers")
    .update({
      name: input.name,
      contact_name: input.contactName ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      notes: input.notes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return fromRow(data as SupplierRow);
}

export async function deleteSupplier(id: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("suppliers")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
