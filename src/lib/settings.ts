import { cache } from "react";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export interface SiteSettings {
  businessName: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  addressLine: string;
  addressCity: string;
  hoursWeekday: string;
  hoursSaturday: string;
}

interface SettingsRow {
  business_name: string;
  whatsapp_number: string;
  whatsapp_display: string;
  address_line: string;
  address_city: string;
  hours_weekday: string;
  hours_saturday: string;
}

function fromRow(row: SettingsRow): SiteSettings {
  return {
    businessName: row.business_name,
    whatsappNumber: row.whatsapp_number,
    whatsappDisplay: row.whatsapp_display,
    addressLine: row.address_line,
    addressCity: row.address_city,
    hoursWeekday: row.hours_weekday,
    hoursSaturday: row.hours_saturday,
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
  const { data, error } = await supabaseAdmin()
    .from("site_settings")
    .update({
      business_name: input.businessName,
      whatsapp_number: input.whatsappNumber,
      whatsapp_display: input.whatsappDisplay,
      address_line: input.addressLine,
      address_city: input.addressCity,
      hours_weekday: input.hoursWeekday,
      hours_saturday: input.hoursSaturday,
    })
    .eq("id", "default")
    .select()
    .single();
  if (error) throw error;
  return fromRow(data as SettingsRow);
}

export const GOOGLE_MAPS_PLACE_URL =
  "https://www.google.com/maps/place/Pon%C3%A9+la+pava/@-37.8827105,-67.7994328,18z/data=!3m1!4b1!4m6!3m5!1s0x960acb005520266d:0x9a1a68896ad3d5a9!8m2!3d-37.8827105!4d-67.7981453!16s%2Fg%2F11mlfl_28d";

export function buildMapsUrl(addressLine: string, addressCity: string): string {
  return GOOGLE_MAPS_PLACE_URL;
}

// Free embeddable map iframe with exact coordinates for Poné La Pava in Catriel
export function buildMapsEmbedUrl(
  addressLine: string,
  addressCity: string,
): string {
  return `https://maps.google.com/maps?q=-37.8827105,-67.7981453+(Pon%C3%A9+La+Pava)&z=17&output=embed`;
}
