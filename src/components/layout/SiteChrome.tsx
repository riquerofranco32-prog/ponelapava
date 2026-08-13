"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import WhatsAppFAB from "@/components/ui/WhatsAppFAB";

// /admin has its own dark dashboard shell (AdminShell) — the storefront
// nav/footer/cart/WhatsApp FAB don't belong there.
export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}
