import type { Metadata } from "next";
import { Inter, Playfair_Display, Caveat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { SITE_URL, STORE_ADDRESS_LINE, STORE_ADDRESS_CITY } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["normal", "italic"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Poné La Pava — Yerbas, Mates y Accesorios Premium",
    template: "%s | Poné La Pava",
  },
  description:
    "Especialistas en la cultura del mate. Yerbas seleccionadas, mates artesanales, termos, bombillas y todo lo que necesitás para el mate perfecto.",
  keywords: [
    "yerba mate",
    "mates artesanales",
    "termos stanley",
    "bombillas",
    "accesorios mate",
    "mate premium",
    "argentina",
    "poné la pava",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Poné La Pava",
    title: "Poné La Pava — Yerbas, Mates y Accesorios Premium",
    description:
      "Especialistas en la cultura del mate. Todo lo que necesitás para el mate perfecto.",
    images: [
      {
        url: "/hero_background_1786545961305.png",
        width: 1200,
        height: 630,
        alt: "Poné La Pava",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Poné La Pava",
    description: "Especialistas en la cultura del mate.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Poné La Pava",
  description:
    "Especialistas en la cultura del mate. Yerbas seleccionadas, mates artesanales, termos y bombillas.",
  url: SITE_URL,
  address: {
    "@type": "PostalAddress",
    streetAddress: STORE_ADDRESS_LINE,
    addressCountry: STORE_ADDRESS_CITY,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable} ${caveat.variable}`}
    >
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
