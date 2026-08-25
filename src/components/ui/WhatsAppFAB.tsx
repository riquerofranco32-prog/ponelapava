import WhatsAppFloatingWidget from "@/components/layout/WhatsAppFloatingWidget";
import { getSiteSettings } from "@/lib/settings";

export default async function WhatsAppFAB() {
  const settings = await getSiteSettings();

  return <WhatsAppFloatingWidget whatsappNumber={settings.whatsappNumber} />;
}
