import { supabaseAdmin } from "@/lib/supabase";
import { Coupon, CouponInput } from "@/types";

interface CouponRow {
  id: string;
  code: string;
  discount_type: Coupon["discountType"];
  discount_value: number;
  valid_from: string | null;
  valid_until: string | null;
  active: boolean;
  created_at: string;
}

function fromRow(row: CouponRow): Coupon {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    validFrom: row.valid_from ?? undefined,
    validUntil: row.valid_until ?? undefined,
    active: row.active,
    createdAt: row.created_at,
  };
}

export async function getCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabaseAdmin()
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as CouponRow[]).map(fromRow);
}

export async function createCoupon(input: CouponInput): Promise<Coupon> {
  const { data, error } = await supabaseAdmin()
    .from("coupons")
    .insert({
      code: input.code.trim().toUpperCase(),
      discount_type: input.discountType,
      discount_value: input.discountValue,
      valid_from: input.validFrom ?? null,
      valid_until: input.validUntil ?? null,
      active: input.active,
    })
    .select()
    .single();
  if (error) throw error;
  return fromRow(data as CouponRow);
}

export async function updateCoupon(
  id: string,
  input: CouponInput,
): Promise<Coupon> {
  const { data, error } = await supabaseAdmin()
    .from("coupons")
    .update({
      code: input.code.trim().toUpperCase(),
      discount_type: input.discountType,
      discount_value: input.discountValue,
      valid_from: input.validFrom ?? null,
      valid_until: input.validUntil ?? null,
      active: input.active,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return fromRow(data as CouponRow);
}

export async function deleteCoupon(id: string): Promise<void> {
  const { error } = await supabaseAdmin().from("coupons").delete().eq("id", id);
  if (error) throw error;
}

// Postgres "undefined_table" (direct) / PostgREST "table not in schema cache"
// — both mean supabase-migration-store-integrity.sql hasn't been run yet.
export const MISSING_TABLE_CODES = ["42P01", "PGRST205"];

export interface ValidCoupon {
  code: string;
  discountType: Coupon["discountType"];
  discountValue: number;
}

export type CouponCheck =
  | { valid: true; coupon: ValidCoupon }
  | { valid: false; error: string; status: number };

// Single validation path for both the storefront's "aplicar cupón" button and
// the order endpoint's server-side recompute — a coupon that the cart shows as
// valid is exactly the one the order is priced with.
//
// Uses the service-role client on purpose: `coupons` has RLS with no public
// policy, so the anon client always comes back empty (every code would read as
// "no existe"). Only the discount fields are ever returned to the browser.
export async function checkCoupon(rawCode: string): Promise<CouponCheck> {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, error: "Código de cupón requerido", status: 400 };
  }

  const { data, error } = await supabaseAdmin()
    .from("coupons")
    .select("code, discount_type, discount_value, valid_from, valid_until")
    .eq("code", code)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    if (MISSING_TABLE_CODES.includes(error.code ?? "")) {
      return {
        valid: false,
        error: "Los cupones no están disponibles por el momento",
        status: 503,
      };
    }
    throw error;
  }

  if (!data) {
    return {
      valid: false,
      error: "El cupón no existe o está inactivo",
      status: 404,
    };
  }

  const now = new Date();
  if (data.valid_from && new Date(data.valid_from) > now) {
    return {
      valid: false,
      error: "Este cupón todavía no está vigente",
      status: 400,
    };
  }
  if (data.valid_until && new Date(data.valid_until) < now) {
    return { valid: false, error: "Este cupón ya ha expirado", status: 400 };
  }

  return {
    valid: true,
    coupon: {
      code: data.code,
      discountType: data.discount_type,
      discountValue: data.discount_value,
    },
  };
}
