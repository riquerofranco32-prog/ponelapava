import { Metadata } from "next";
import MarketingPanel from "@/components/admin/MarketingPanel";

export const metadata: Metadata = {
  title: "Personalizar Landing & Fotos — Admin Poné La Pava",
};

export default function MarketingPage() {
  return <MarketingPanel />;
}
