import { cache } from "react";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import {
  OpeningHours,
  normalizeOpeningHours,
} from "@/lib/hours";

export type AvailablePaymentMethod = "transfer" | "cash" | "card";

export interface SiteSettings {
  businessName: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  addressLine: string;
  addressCity: string;
  hoursWeekday: string;
  hoursSaturday: string;
  paymentMethods: AvailablePaymentMethod[];
  openingHours: OpeningHours;
  closedDates: string[];
}

interface SettingsRow {
  business_name: string;
  whatsapp_number: string;
  whatsapp_display: string;
  address_line: string;
  address_city: string;
  hours_weekday: string;
  hours_saturday: string;
  payment_methods?: string[] | null;
  opening_hours?: OpeningHours | null;
  closed_dates?: string[] | null;
}

function fromRow(row: SettingsRow): SiteSettings {
  const rawMethods = Array.isArray(row.payment_methods) ? row.payment_methods : [];
  const validMethods = rawMethods.filter(
    (m): m is AvailablePaymentMethod => m === "transfer" || m === "cash" || m === "card",
  );

  const openingHours = normalizeOpeningHours(
    row.opening_hours,
    row.hours_weekday,
    row.hours_saturday,
  );
  const closedDates = Array.isArray(row.closed_dates) ? row.closed_dates : [];

  return {
    businessName: row.business_name,
    whatsappNumber: row.whatsapp_number,
    whatsappDisplay: row.whatsapp_display,
    addressLine: row.address_line,
    addressCity: row.address_city,
    hoursWeekday: row.hours_weekday,
    hoursSaturday: row.hours_saturday,
    paymentMethods: validMethods.length > 0 ? validMethods : ["transfer", "cash", "card"],
    openingHours,
    closedDates,
  };
}

// React's cache() dedupes this across every server component that calls it
// within the same request — each page ends up making one query, not one
// per component that needs the WhatsApp number or address.
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "default")
    .single();
  if (error) throw error;
  return fromRow(data as SettingsRow);
});

export type SiteSettingsInput = SiteSettings;

export async function updateSiteSettings(
  input: SiteSettingsInput,
): Promise<SiteSettings> {
  const openingHours = normalizeOpeningHours(
    input.openingHours,
    input.hoursWeekday,
    input.hoursSaturday,
  );
  const closedDates = Array.isArray(input.closedDates) ? input.closedDates : [];

  const weekdayRange =
    openingHours.tue.ranges[0] ||
    openingHours.wed.ranges[0] ||
    openingHours.thu.ranges[0] ||
    openingHours.fri.ranges[0];
  const saturdayRange = openingHours.sat.ranges[0];

  const hoursWeekday = weekdayRange
    ? `${weekdayRange.open} – ${weekdayRange.close}`
    : input.hoursWeekday || "09:00 – 19:00";
  const hoursSaturday = saturdayRange
    ? `${saturdayRange.open} – ${saturdayRange.close}`
    : input.hoursSaturday || "09:00 – 14:00";

  const payload: Record<string, unknown> = {
    business_name: input.businessName,
    whatsapp_number: input.whatsappNumber,
    whatsapp_display: input.whatsappDisplay,
    address_line: input.addressLine,
    address_city: input.addressCity,
    hours_weekday: hoursWeekday,
    hours_saturday: hoursSaturday,
    payment_methods: input.paymentMethods || ["transfer", "cash", "card"],
    opening_hours: openingHours,
    closed_dates: closedDates,
  };

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("site_settings")
    .update(payload)
    .eq("id", "default")
    .select()
    .single();

  if (error) {
    if (error.code === "42703" || error.code === "PGRST204") {
      delete payload.opening_hours;
      delete payload.closed_dates;
      delete payload.payment_methods;
      const retry = await admin
        .from("site_settings")
        .update(payload)
        .eq("id", "default")
        .select()
        .single();
      if (retry.error) throw retry.error;
      return fromRow(retry.data as SettingsRow);
    }
    throw error;
  }
  return fromRow(data as SettingsRow);
}

export function getProductPaymentMethodsLabel(
  paymentMethods?: AvailablePaymentMethod[],
): string {
  const methods =
    paymentMethods && paymentMethods.length > 0
      ? paymentMethods
      : (["transfer", "cash", "card"] as AvailablePaymentMethod[]);
  const labels: string[] = [];
  if (methods.includes("transfer")) labels.push("Transferencia");
  if (methods.includes("cash")) labels.push("Efectivo");
  if (methods.includes("card")) labels.push("Mercado Pago");
  return labels.join(" · ") || "Transferencia · Efectivo · Mercado Pago";
}

export function getStorePaymentMethodsSummary(
  paymentMethods?: AvailablePaymentMethod[],
): string {
  const methods =
    paymentMethods && paymentMethods.length > 0
      ? paymentMethods
      : (["transfer", "cash", "card"] as AvailablePaymentMethod[]);
  const names: string[] = [];
  if (methods.includes("transfer")) names.push("Transferencia");
  if (methods.includes("card")) names.push("Mercado Pago");
  if (methods.includes("cash")) names.push("Efectivo");
  if (names.length <= 1) return names[0] || "Transferencia";
  if (names.length === 2) return `${names[0]} o ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} o ${names[names.length - 1]}`;
}

export const GOOGLE_MAPS_PLACE_URL =
  "https://www.google.com/maps/place/Pon%C3%A9+la+pava/@-37.8827105,-67.7994328,18z/data=!3m1!4b1!4m6!3m5!1s0x960acb005520266d:0x9a1a68896ad3d5a9!8m2!3d-37.8827105!4d-67.7981453!16s%2Fg%2F11mlfl_28d";

// Coordenadas fijas del local en Catriel — la dirección configurable es
// para mostrar, no para geocodificar.
export function buildMapsUrl(): string {
  return GOOGLE_MAPS_PLACE_URL;
}

export function buildMapsEmbedUrl(): string {
  return "https://maps.google.com/maps?q=-37.8827105,-67.7981453+(Pon%C3%A9+La+Pava)&z=17&output=embed";
}
