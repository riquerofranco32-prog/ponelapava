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
