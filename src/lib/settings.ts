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

export function buildMapsUrl(addressLine: string, addressCity: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${addressLine}, ${addressCity}`,
  )}`;
}

// Free embeddable map iframe — no Google Cloud API key needed (unlike the
// Maps Embed API / JS API), which this single-store site has no use for
// otherwise. Precise enough for a "here's roughly where we are" section.
export function buildMapsEmbedUrl(
  addressLine: string,
  addressCity: string,
): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(
    `${addressLine}, ${addressCity}`,
  )}&z=16&output=embed`;
}
