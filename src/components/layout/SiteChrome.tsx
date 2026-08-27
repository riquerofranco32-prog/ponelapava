"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import CartDrawer from "@/components/cart/CartDrawer";
import FavoritesDrawer from "@/components/cart/FavoritesDrawer";
import SocialProofToaster from "@/components/ui/SocialProofToaster";
import LuckyWheelModal from "@/components/ui/LuckyWheelModal";
import ProductComparisonDrawer from "@/components/catalog/ProductComparisonDrawer";
import { useFavorites } from "@/context/FavoritesContext";

// /admin has its own dark dashboard shell (AdminShell), and /login is a
// bare full-screen form — the storefront nav/footer/cart/WhatsApp FAB
// don't belong on either.
//
// Footer and WhatsAppFAB are async server components — a "use client" module
// can't import and render an async component directly (Next treats anything
// imported into a client module as client-bundled, and async client
// components aren't allowed), so RootLayout renders them and passes the
// result down as plain React nodes instead.
export default function SiteChrome({
  children,
  footer,
  whatsAppFab,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
  whatsAppFab: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isOpen: isFavoritesOpen, setDrawer: setFavoritesDrawer } = useFavorites();

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/login")) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setFavoritesDrawer(false)}
      />
      <ProductComparisonDrawer />
      <LuckyWheelModal />
      <SocialProofToaster />
      <main>{children}</main>
      {footer}
      {whatsAppFab}
    </>
  );
}
