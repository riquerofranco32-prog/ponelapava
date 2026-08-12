import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

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

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">
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
