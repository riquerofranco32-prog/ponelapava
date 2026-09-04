import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BrandsSection from "@/components/home/BrandsSection";
import LocalSection from "@/components/home/LocalSection";
import AboutSection from "@/components/home/AboutSection";
import InstagramSection from "@/components/home/InstagramSection";
import { getLandingContent } from "@/lib/landing";

// Below-the-fold client widgets — code-split so their JS doesn't compete
// with the Hero for the main thread during LCP/hydration.
const ComboPacksSection = dynamic(
  () => import("@/components/home/ComboPacksSection"),
);
const CustomKitBuilder = dynamic(
  () => import("@/components/home/CustomKitBuilder"),
);
const MateAnatomy = dynamic(() => import("@/components/home/MateAnatomy"));
const HowToBuy = dynamic(() => import("@/components/home/HowToBuy"));
const GoogleReviews = dynamic(() => import("@/components/home/GoogleReviews"));
const FAQSection = dynamic(() => import("@/components/home/FAQSection"));
const FinalCTA = dynamic(() => import("@/components/home/FinalCTA"));

// Products and landing content come from Supabase and are editable from /admin — revalidate
// periodically instead of baking them in at build time.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Poné La Pava — Yerbas, Mates y Accesorios Premium",
  description:
    "Especialistas en la cultura del mate. Yerbas seleccionadas, mates artesanales, termos, bombillas y todo lo que necesitás para el mate perfecto. Local físico y envíos.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const landing = await getLandingContent();

  return (
    <>
      <Hero content={landing.hero} />
      <TrustBar />
      <Categories />
      <FeaturedProducts />
      <ComboPacksSection />
      <CustomKitBuilder />
      <MateAnatomy />
      <BrandsSection />
      <HowToBuy />
      <LocalSection />
      <GoogleReviews />
      <AboutSection />
      <FAQSection />
      <InstagramSection posts={landing.galleryPosts} />
      <FinalCTA />
    </>
  );
}
