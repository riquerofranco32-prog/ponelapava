import type { Metadata } from "next";
import { Montserrat, Playfair_Display, Caveat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { ComparisonProvider } from "@/context/ComparisonContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import SiteChrome from "@/components/layout/SiteChrome";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/ui/WhatsAppFAB";
import { SITE_URL } from "@/lib/site";
import { getSiteSettings } from "@/lib/settings";
import { parseOpeningHoursRange } from "@/lib/hours";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
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

// Address (used in JSON-LD below) comes from Supabase and is editable from
// /admin — revalidate periodically instead of baking it in at build time.
export const revalidate = 60;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Poné La Pava — Yerbas, Mates y Accesorios Premium",
    template: "%s | Poné La Pava",
  },
  description:
    "Especialistas en la cultura del mate. Yerbas seleccionadas, mates artesanales, termos, bombillas y todo lo que necesitás para el mate perfecto.",
  alternates: { canonical: "/" },
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  const [weekdayOpens, weekdayCloses] = parseOpeningHoursRange(
    settings.hoursWeekday,
  );
  const [saturdayOpens, saturdayCloses] = parseOpeningHoursRange(
    settings.hoursSaturday,
  );

  const businessJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Poné La Pava",
    description:
      "Especialistas en la cultura del mate. Yerbas seleccionadas, mates artesanales, termos y bombillas.",
    url: SITE_URL,
    image: `${SITE_URL}/hero_background_1786545961305.png`,
    telephone: settings.whatsappDisplay,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.addressLine,
      addressLocality: settings.addressCity,
      addressCountry: "AR",
    },
    // Closed Sundays, matching the isStoreOpenNow() rule the "open now"
    // badge uses — keep both in sync if that ever changes.
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: weekdayOpens,
        closes: weekdayCloses,
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: saturdayOpens,
        closes: saturdayCloses,
      },
    ],
  };

  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${playfair.variable} ${caveat.variable}`}
    >
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
        <SiteSettingsProvider settings={settings}>
          <FavoritesProvider>
            <ComparisonProvider>
              <CartProvider>
                <SiteChrome footer={<Footer />} whatsAppFab={<WhatsAppFAB />}>
                  {children}
                </SiteChrome>
              </CartProvider>
            </ComparisonProvider>
          </FavoritesProvider>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
